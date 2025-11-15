/**
 * Seed скрипт для заполнения БД тестовыми данными
 * 
 * Запуск: docker-compose exec app npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начало seed...');

  // Хэшируем пароли
  const hashedPassword = await bcrypt.hash('Password123!', 12);

  // ============================================================
  // 1. Создаём тестовых пользователей
  // ============================================================

  console.log('📝 Создание пользователей...');

  // Admin (password: admin123)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@neiro.dev' },
    update: {},
    create: {
      email: 'admin@neiro.dev',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Admin',
      lastName: 'Adminov',
      role: 'admin',
      status: 'active',
      timezone: 'Asia/Tashkent',
    },
  });

  // Супервизор (password: supervisor123)
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@neiro.dev' },
    update: {},
    create: {
      email: 'supervisor@neiro.dev',
      password: await bcrypt.hash('supervisor123', 12),
      firstName: 'Ольга',
      lastName: 'Супервизорова',
      role: 'supervisor',
      status: 'active',
      timezone: 'Europe/Moscow',
    },
  });

  // Ведущий нейропсихолог (password: neuro123)
  const neuropsychologist = await prisma.user.upsert({
    where: { email: 'neuro@neiro.dev' },
    update: {},
    create: {
      email: 'neuro@neiro.dev',
      password: await bcrypt.hash('neuro123', 12),
      firstName: 'Мария',
      lastName: 'Нейропсихологова',
      role: 'specialist',
      status: 'active',
      phone: '+998901234567',
      timezone: 'Asia/Tashkent',
    },
  });

  // Логопед (password: speech123)
  const speechTherapist = await prisma.user.upsert({
    where: { email: 'speech@neiro.dev' },
    update: {},
    create: {
      email: 'speech@neiro.dev',
      password: await bcrypt.hash('speech123', 12),
      firstName: 'Анна',
      lastName: 'Логопедова',
      role: 'specialist',
      status: 'active',
      phone: '+998901234568',
      timezone: 'Asia/Tashkent',
    },
  });

  // ABA-терапевт (password: aba123)
  const abaTherapist = await prisma.user.upsert({
    where: { email: 'aba@neiro.dev' },
    update: {},
    create: {
      email: 'aba@neiro.dev',
      password: await bcrypt.hash('aba123', 12),
      firstName: 'Елена',
      lastName: 'ABA-терапевтова',
      role: 'specialist',
      status: 'active',
      phone: '+998901234569',
      timezone: 'Asia/Tashkent',
    },
  });

  // Родители
  // Родитель 1 (password: parent123)
  const parent1 = await prisma.user.upsert({
    where: { email: 'parent1@example.com' },
    update: {},
    create: {
      email: 'parent1@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Анвар',
      lastName: 'Иванов',
      role: 'parent',
      status: 'active',
      phone: '+998901111111',
      timezone: 'Asia/Tashkent',
    },
  });

  // Родитель 2 (password: parent123)
  const parent2 = await prisma.user.upsert({
    where: { email: 'parent2@example.com' },
    update: {},
    create: {
      email: 'parent2@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Наталья',
      lastName: 'Петрова',
      role: 'parent',
      status: 'active',
      phone: '+998902222222',
      timezone: 'Europe/Moscow',
    },
  });

  console.log(`✅ Создано пользователей: 7`);

  // ============================================================
  // 2. Создаём профили специалистов
  // ============================================================

  console.log('📝 Создание профилей специалистов...');

  const neuroSpecialist = await prisma.specialist.upsert({
    where: { userId: neuropsychologist.id },
    update: {},
    create: {
      userId: neuropsychologist.id,
      specialty: 'neuropsychologist',
      licenseNumber: 'NP-2024-001',
      licenseValidUntil: new Date('2026-12-31'),
      experienceYears: 8,
      bio: 'Опытный нейропсихолог, специализация на работе с детьми с РАС',
    },
  });

  const speechSpecialist = await prisma.specialist.upsert({
    where: { userId: speechTherapist.id },
    update: {},
    create: {
      userId: speechTherapist.id,
      specialty: 'speech_therapist',
      licenseNumber: 'SP-2024-002',
      licenseValidUntil: new Date('2026-06-30'),
      experienceYears: 5,
      bio: 'Логопед с опытом работы в инклюзивном образовании',
    },
  });

  const abaSpecialist = await prisma.specialist.upsert({
    where: { userId: abaTherapist.id },
    update: {},
    create: {
      userId: abaTherapist.id,
      specialty: 'aba',
      licenseNumber: 'ABA-2024-003',
      licenseValidUntil: new Date('2025-12-31'),
      experienceYears: 3,
      bio: 'Сертифицированный ABA-терапевт',
    },
  });

  const supervisorSpecialist = await prisma.specialist.upsert({
    where: { userId: supervisor.id },
    update: {},
    create: {
      userId: supervisor.id,
      specialty: 'supervisor',
      licenseNumber: 'SUP-2024-004',
      licenseValidUntil: new Date('2027-12-31'),
      experienceYears: 15,
      bio: 'Супервизор с большим опытом в области нейропсихологии',
    },
  });

  console.log(`✅ Создано специалистов: 4`);

  // ============================================================
  // 3. Создаём детей
  // ============================================================

  console.log('📝 Создание профилей детей...');

  const child1 = await prisma.child.create({
    data: {
      firstName: 'Артем',
      lastName: 'Иванов',
      birthDate: new Date('2018-05-15'),
      gender: 'male',
      diagnosisSummary: 'РАС, средняя степень тяжести, задержка речевого развития',
      notes: 'Любит конструкторы, избегает громких звуков',
    },
  });

  const child2 = await prisma.child.create({
    data: {
      firstName: 'София',
      lastName: 'Петрова',
      birthDate: new Date('2019-11-20'),
      gender: 'female',
      diagnosisSummary: 'РАС легкой степени, коммуникативные трудности',
      notes: 'Интересуется рисованием, хорошо воспринимает визуальные подсказки',
    },
  });

  console.log(`✅ Создано детей: 2`);

  // ============================================================
  // 4. Связываем детей с родителями
  // ============================================================

  console.log('📝 Связывание детей с родителями...');

  await prisma.childParent.create({
    data: {
      childId: child1.id,
      parentUserId: parent1.id,
      legalGuardian: true,
      relationship: 'father',
      linkedAt: new Date(),
    },
  });

  await prisma.childParent.create({
    data: {
      childId: child2.id,
      parentUserId: parent2.id,
      legalGuardian: true,
      relationship: 'mother',
      linkedAt: new Date(),
    },
  });

  console.log(`✅ Связей детей с родителями: 2`);

  // ============================================================
  // 5. Назначаем специалистов детям
  // ============================================================

  console.log('📝 Назначение специалистов...');

  // Ребенок 1: команда из нейропсихолога, логопеда, ABA
  await prisma.childSpecialist.create({
    data: {
      childId: child1.id,
      specialistId: neuroSpecialist.id,
      specialization: 'lead',
      isPrimary: true,
      roleDescription: 'Ведущий специалист, координация маршрута',
    },
  });

  await prisma.childSpecialist.create({
    data: {
      childId: child1.id,
      specialistId: speechSpecialist.id,
      specialization: 'speech',
      isPrimary: false,
      roleDescription: 'Коррекция речевого развития',
    },
  });

  await prisma.childSpecialist.create({
    data: {
      childId: child1.id,
      specialistId: abaSpecialist.id,
      specialization: 'aba',
      isPrimary: false,
      roleDescription: 'Поведенческая терапия',
    },
  });

  // Ребенок 2: нейропсихолог + логопед
  await prisma.childSpecialist.create({
    data: {
      childId: child2.id,
      specialistId: neuroSpecialist.id,
      specialization: 'lead',
      isPrimary: true,
      roleDescription: 'Ведущий специалист',
    },
  });

  await prisma.childSpecialist.create({
    data: {
      childId: child2.id,
      specialistId: speechSpecialist.id,
      specialization: 'speech',
      isPrimary: false,
      roleDescription: 'Развитие коммуникативных навыков',
    },
  });

  console.log(`✅ Назначений специалистов: 5`);

  // ============================================================
  // 6. Создаём базовые упражнения
  // ============================================================

  console.log('📝 Создание упражнений...');

  const exercises = [
    {
      title: 'Сортировка по цветам',
      slug: 'sorting-by-colors',
      description: 'Упражнение на развитие восприятия цветов и классификации',
      category: 'cognitive',
      ageMin: 3,
      ageMax: 6,
      difficulty: 'beginner',
      durationMinutes: 15,
      materials: { items: ['Цветные карточки', 'Корзинки'] },
      instructions: {
        steps: [
          'Разложить перед ребенком цветные карточки',
          'Показать пример сортировки',
          'Попросить ребенка разложить карточки по цветам',
        ],
      },
      successCriteria: { accuracy: 80, independentCompletion: true },
    },
    {
      title: 'Повторение звуков',
      slug: 'sound-repetition',
      description: 'Упражнение на развитие фонематического слуха',
      category: 'speech',
      ageMin: 2,
      ageMax: 7,
      difficulty: 'beginner',
      durationMinutes: 10,
      materials: { items: ['Карточки со звуками'] },
      instructions: {
        steps: [
          'Произносить простые звуки',
          'Просить ребенка повторить',
          'Поощрять каждую попытку',
        ],
      },
      successCriteria: { correctRepetitions: 70 },
    },
    {
      title: 'Пальчиковая гимнастика',
      slug: 'finger-gymnastics',
      description: 'Упражнение на развитие мелкой моторики',
      category: 'motor',
      ageMin: 2,
      ageMax: 5,
      difficulty: 'beginner',
      durationMinutes: 10,
      materials: { items: [] },
      instructions: {
        steps: [
          'Показать упражнения для пальцев',
          'Выполнить вместе с ребенком',
          'Повторить 5-7 раз',
        ],
      },
      successCriteria: { motorSkillImprovement: true },
    },
  ];

  for (const ex of exercises) {
    await prisma.exercise.create({ data: ex });
  }

  console.log(`✅ Создано упражнений: ${exercises.length}`);

  console.log('🎉 Seed завершен успешно!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

