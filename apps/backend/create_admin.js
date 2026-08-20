const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Codegnan@2018', 10);
  const user = await prisma.user.upsert({
    where: { email: 'superadmin@codegnan.com' },
    update: {
      password: password,
      roleId: 'role_super_admin',
    },
    create: {
      email: 'superadmin@codegnan.com',
      username: 'superadmin2026',
      password: password,
      name: 'Super Admin',
      roleId: 'role_super_admin',
      branchId: 'branch_jntu1',
      locationId: 'loc_hyderabad',
      departmentId: 'dept_operations'
    }
  });
  console.log('User created:', user.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
