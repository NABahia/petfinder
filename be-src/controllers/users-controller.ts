import { User } from "../models";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Falta configurar JWT_SECRET en las variables de entorno.");
  }
  return secret;
}

export async function loginUser(email: string, passwordString: string) {
  if (!email || !passwordString) {
    throw new Error("Debés ingresar email y contraseña.");
  }

  const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });

  if (!user) {
    throw new Error("Email o contraseña incorrectos.");
  }

  const isPasswordCorrect = await bcrypt.compare(
    passwordString,
    user.getDataValue("password"),
  );

  if (!isPasswordCorrect) {
    throw new Error("Email o contraseña incorrectos.");
  }

  const token = jwt.sign(
    { id: user.getDataValue("id") },
    getJwtSecret(),
    { expiresIn: "24h" },
  );

  return token;
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
}) {
  const name = userData.name?.trim();
  const email = userData.email?.trim().toLowerCase();
  const password = userData.password;

  if (!name || !email || !password) {
    throw new Error("Faltan campos obligatorios (name, email, password).");
  }

  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new Error("El email ya está registrado.");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: newUser.getDataValue("id"),
    name: newUser.getDataValue("name"),
    email: newUser.getDataValue("email"),
  };
}

export async function getUser(userId: number | string) {
  const user = await User.findByPk(userId);
  if (!user) {
    return null;
  }

  return {
    id: user.getDataValue("id"),
    name: user.getDataValue("name"),
    email: user.getDataValue("email"),
  };
}

export async function updateUser(
  userId: number,
  updateData: { name?: string; password?: string },
) {
  const updateObject: Record<string, string> = {};

  if (updateData.name && updateData.name.trim()) {
    updateObject.name = updateData.name.trim();
  }

  if (updateData.password) {
    const saltRounds = 10;
    updateObject.password = await bcrypt.hash(updateData.password, saltRounds);
  }

  if (Object.keys(updateObject).length === 0) {
    throw new Error("No se enviaron campos válidos para actualizar.");
  }

  await User.update(updateObject, {
    where: { id: userId },
  });

  const updatedUser = await User.findByPk(userId);
  if (!updatedUser) {
    throw new Error("Usuario no encontrado.");
  }

  return {
    id: updatedUser.getDataValue("id"),
    name: updatedUser.getDataValue("name"),
    email: updatedUser.getDataValue("email"),
  };
}
