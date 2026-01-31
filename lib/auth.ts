import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(
  email: string,
  password: string,
  role: UserRole,
  nomAgence?: string,
  plan?: string,
  firstName?: string,
  lastName?: string,
  telephone?: string
) {
  const hashedPassword = await hashPassword(password)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà')
  }

  // Create user and profile in a transaction
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      profile: {
        create: {
          nomAgence: role === 'agence' ? nomAgence : null,
          plan: role === 'agence' ? plan : null,
          subscriptionStatus: role === 'agence' ? 'PENDING' : 'ACTIVE', // Agencies start as PENDING until payment
          prenom: firstName, // Using prenom for buyer name
          nom: lastName,
          telephone: telephone
        },
      },
    },
    include: {
      profile: true,
    },
  })

  return user
}

export async function authenticateUser(email: string, password: string, role?: UserRole) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
    },
  })

  if (!user) {
    throw new Error('Email ou mot de passe incorrect')
  }

  if (role && user.role !== role) {
    const roleName = role === 'acquereur' ? 'acquéreur' : 'agence'
    const actualRoleName = user.role === 'acquereur' ? 'acquéreur' : user.role === 'agence' ? 'agence' : 'admin'

    // Debug log
    console.error(`Login failed: Role mismatch. Expected ${role} (${roleName}), got ${user.role}`)

    throw new Error(`Ce compte est un compte ${actualRoleName}, pas un compte ${roleName}. Veuillez vous connecter sur le bon portail.`)
  }

  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    throw new Error('Email ou mot de passe incorrect')
  }

  // Remove password from returned user
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
    },
  })

  if (!user) {
    return null
  }

  // Remove password from returned user
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
    },
  })

  if (!user) {
    return null
  }

  // Remove password from returned user
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}
