/**
 * Seed скрипт для заполнения БД тестовыми данными
 * 
 * Запуск: docker-compose exec app npm run db:seed
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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

  // Specialist 1: Нейропсихолог (password: admin123)
  const specialist1 = await prisma.user.upsert({
    where: { email: 'specialist1@example.com' },
    update: {},
    create: {
      email: 'specialist1@example.com',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Анна',
      lastName: 'Смирнова',
      role: 'specialist',
      status: 'active',
      phone: '+998901234567',
      timezone: 'Asia/Tashkent',
    },
  });

  // Specialist 2: Логопед (password: admin123)
  const specialist2 = await prisma.user.upsert({
    where: { email: 'specialist2@example.com' },
    update: {},
    create: {
      email: 'specialist2@example.com',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Елена',
      lastName: 'Кузнецова',
      role: 'specialist',
      status: 'active',
      phone: '+998901234568',
      timezone: 'Asia/Tashkent',
    },
  });

  // Specialist 3: ABA-терапевт (password: admin123)
  const specialist3 = await prisma.user.upsert({
    where: { email: 'specialist3@example.com' },
    update: {},
    create: {
      email: 'specialist3@example.com',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Дмитрий',
      lastName: 'Соколов',
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

  // Родитель 3 (password: parent123)
  const parent3 = await prisma.user.upsert({
    where: { email: 'parent3@example.com' },
    update: {},
    create: {
      email: 'parent3@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Дмитрий',
      lastName: 'Сидоров',
      role: 'parent',
      status: 'active',
      phone: '+998903333333',
      timezone: 'Asia/Tashkent',
    },
  });

  // Родитель 4 (password: parent123)
  const parent4 = await prisma.user.upsert({
    where: { email: 'parent4@example.com' },
    update: {},
    create: {
      email: 'parent4@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Елена',
      lastName: 'Михайлова',
      role: 'parent',
      status: 'active',
      phone: '+998904444444',
      timezone: 'Europe/Moscow',
    },
  });

  // Родитель 5 (password: parent123)
  const parent5 = await prisma.user.upsert({
    where: { email: 'parent5@example.com' },
    update: {},
    create: {
      email: 'parent5@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Сергей',
      lastName: 'Козлов',
      role: 'parent',
      status: 'active',
      phone: '+998905555555',
      timezone: 'Asia/Tashkent',
    },
  });

  // Родитель 6 (password: parent123)
  const parent6 = await prisma.user.upsert({
    where: { email: 'parent6@example.com' },
    update: {},
    create: {
      email: 'parent6@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Мария',
      lastName: 'Волкова',
      role: 'parent',
      status: 'active',
      phone: '+998906666666',
      timezone: 'Europe/Moscow',
    },
  });

  // Родитель 7 (password: parent123)
  const parent7 = await prisma.user.upsert({
    where: { email: 'parent7@example.com' },
    update: {},
    create: {
      email: 'parent7@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Алексей',
      lastName: 'Новиков',
      role: 'parent',
      status: 'active',
      phone: '+998907777777',
      timezone: 'Asia/Tashkent',
    },
  });

  // Родитель 8 (password: parent123)
  const parent8 = await prisma.user.upsert({
    where: { email: 'parent8@example.com' },
    update: {},
    create: {
      email: 'parent8@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Ирина',
      lastName: 'Морозова',
      role: 'parent',
      status: 'active',
      phone: '+998908888888',
      timezone: 'Europe/Moscow',
    },
  });

  // Родитель 9 (password: parent123)
  const parent9 = await prisma.user.upsert({
    where: { email: 'parent9@example.com' },
    update: {},
    create: {
      email: 'parent9@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Виктор',
      lastName: 'Соколов',
      role: 'parent',
      status: 'active',
      phone: '+998909999999',
      timezone: 'Asia/Tashkent',
    },
  });

  // Родитель 10 (password: parent123)
  const parent10 = await prisma.user.upsert({
    where: { email: 'parent10@example.com' },
    update: {},
    create: {
      email: 'parent10@example.com',
      password: await bcrypt.hash('parent123', 12),
      firstName: 'Татьяна',
      lastName: 'Лебедева',
      role: 'parent',
      status: 'active',
      phone: '+998901010101',
      timezone: 'Europe/Moscow',
    },
  });

  console.log(`✅ Создано пользователей: 15`);

  // ============================================================
  // 2. Создаём профили специалистов
  // ============================================================

  console.log('📝 Создание профилей специалистов...');

  const spec1 = await prisma.specialist.upsert({
    where: { userId: specialist1.id },
    update: {},
    create: {
      userId: specialist1.id,
      specialty: 'neuropsychologist',
      licenseNumber: 'NP-2024-001',
      licenseValidUntil: new Date('2026-12-31'),
      experienceYears: 8,
      bio: 'Опытный нейропсихолог, специализация на работе с детьми с РАС',
    },
  });

  const spec2 = await prisma.specialist.upsert({
    where: { userId: specialist2.id },
    update: {},
    create: {
      userId: specialist2.id,
      specialty: 'speech_therapist',
      licenseNumber: 'SP-2024-002',
      licenseValidUntil: new Date('2026-06-30'),
      experienceYears: 5,
      bio: 'Логопед с опытом работы в инклюзивном образовании',
    },
  });

  const spec3 = await prisma.specialist.upsert({
    where: { userId: specialist3.id },
    update: {},
    create: {
      userId: specialist3.id,
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

  // Создаём детей для тестовых сценариев CJM
  // CJM требует: Алиса Иванова (5 лет) и Борис Петров (7 лет)
  let child1 = await prisma.child.findFirst({
    where: {
      firstName: 'Алиса',
      lastName: 'Иванова',
      birthDate: new Date('2018-05-15'),
    },
  });

  if (!child1) {
    child1 = await prisma.child.create({
      data: {
        firstName: 'Алиса',
        lastName: 'Иванова',
        birthDate: new Date('2018-05-15'), // ~5-6 лет
        gender: 'female',
        diagnosisSummary: 'РАС, средняя степень тяжести',
        notes: 'Любит конструкторы',
      },
    });
  }

  let child2 = await prisma.child.findFirst({
    where: {
      firstName: 'Борис',
      lastName: 'Петров',
      birthDate: new Date('2019-11-20'),
    },
  });

  if (!child2) {
    child2 = await prisma.child.create({
      data: {
        firstName: 'Борис',
        lastName: 'Петров',
        birthDate: new Date('2019-11-20'), // ~5 лет
        gender: 'male',
        diagnosisSummary: 'РАС легкой степени',
        notes: 'Интересуется рисованием',
      },
    });
  }

  console.log(`✅ Проверено/создано детей: 2`);

  // ============================================================
  // 4. Связываем детей с родителями
  // ============================================================

  console.log('📝 Связывание детей с родителями...');

  await prisma.childParent.upsert({
    where: {
      childId_parentUserId: {
        childId: child1.id,
        parentUserId: parent1.id,
      },
    },
    update: {},
    create: {
      childId: child1.id,
      parentUserId: parent1.id,
      legalGuardian: true,
      relationship: 'father',
      linkedAt: new Date(),
    },
  });

  await prisma.childParent.upsert({
    where: {
      childId_parentUserId: {
        childId: child2.id,
        parentUserId: parent2.id,
      },
    },
    update: {},
    create: {
      childId: child2.id,
      parentUserId: parent2.id,
      legalGuardian: true,
      relationship: 'mother',
      linkedAt: new Date(),
    },
  });

  // Для CJM тестов: parent1 должен видеть обоих детей
  await prisma.childParent.upsert({
    where: {
      childId_parentUserId: {
        childId: child2.id,
        parentUserId: parent1.id,
      },
    },
    update: {},
    create: {
      childId: child2.id,
      parentUserId: parent1.id,
      legalGuardian: true,
      relationship: 'mother',
      linkedAt: new Date(),
    },
  });

  console.log(`✅ Связей детей с родителями: 3`);

  // ============================================================
  // 5. Назначаем специалистов детям
  // ============================================================

  console.log('📝 Назначение специалистов...');

  // Алиса: команда из specialist1 (нейропсихолог), specialist2 (логопед), specialist3 (ABA)
  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId_specialization: {
        childId: child1.id,
        specialistId: spec1.id,
        specialization: 'lead',
      },
    },
    update: {},
    create: {
      childId: child1.id,
      specialistId: spec1.id,
      specialization: 'lead',
      isPrimary: true,
      roleDescription: 'Ведущий специалист, координация маршрута',
    },
  });

  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId_specialization: {
        childId: child1.id,
        specialistId: spec2.id,
        specialization: 'speech',
      },
    },
    update: {},
    create: {
      childId: child1.id,
      specialistId: spec2.id,
      specialization: 'speech',
      isPrimary: false,
      roleDescription: 'Коррекция речевого развития',
    },
  });

  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId_specialization: {
        childId: child1.id,
        specialistId: spec3.id,
        specialization: 'aba',
      },
    },
    update: {},
    create: {
      childId: child1.id,
      specialistId: spec3.id,
      specialization: 'aba',
      isPrimary: false,
      roleDescription: 'Поведенческая терапия',
    },
  });

  // Борис: specialist1 (нейропсихолог) + specialist2 (логопед)
  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId_specialization: {
        childId: child2.id,
        specialistId: spec1.id,
        specialization: 'lead',
      },
    },
    update: {},
    create: {
      childId: child2.id,
      specialistId: spec1.id,
      specialization: 'lead',
      isPrimary: true,
      roleDescription: 'Ведущий специалист',
    },
  });

  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId_specialization: {
        childId: child2.id,
        specialistId: spec2.id,
        specialization: 'speech',
      },
    },
    update: {},
    create: {
      childId: child2.id,
      specialistId: spec2.id,
      specialization: 'speech',
      isPrimary: false,
      roleDescription: 'Развитие коммуникативных навыков',
    },
  });

  console.log(`✅ Назначений специалистов: 5`);

  // ============================================================
  // 6. Создаём базовые упражнения (расширенный набор)
  // ============================================================

  console.log('📝 Создание упражнений...');

  const exercises = [
    // Когнитивные упражнения
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
      title: 'Найди пару',
      slug: 'find-the-pair',
      description: 'Игра на развитие памяти и внимания',
      category: 'cognitive',
      ageMin: 4,
      ageMax: 8,
      difficulty: 'beginner',
      durationMinutes: 20,
      materials: { items: ['Парные карточки (10-15 пар)'] },
      instructions: {
        steps: [
          'Разложить карточки рубашкой вверх',
          'Объяснить правила игры',
          'Искать пары, переворачивая по 2 карточки',
        ],
      },
      successCriteria: { accuracy: 75, timeLimit: 300 },
    },
    {
      title: 'Последовательности',
      slug: 'sequences',
      description: 'Упражнение на логику и понимание последовательностей',
      category: 'cognitive',
      ageMin: 5,
      ageMax: 9,
      difficulty: 'intermediate',
      durationMinutes: 25,
      materials: { items: ['Карточки с узорами', 'Рабочая тетрадь'] },
      instructions: {
        steps: [
          'Показать пример последовательности',
          'Попросить продолжить узор',
          'Усложнить задачу постепенно',
        ],
      },
      successCriteria: { correctSequences: 80 },
    },
    {
      title: 'Счет до 10',
      slug: 'counting-to-10',
      description: 'Обучение счету и взаимосвязи число-количество',
      category: 'cognitive',
      ageMin: 3,
      ageMax: 6,
      difficulty: 'beginner',
      durationMinutes: 15,
      materials: { items: ['Счетные палочки', 'Карточки с цифрами'] },
      instructions: {
        steps: [
          'Показать карточку с цифрой',
          'Вместе отсчитать нужное количество палочек',
          'Повторить с разными цифрами',
        ],
      },
      successCriteria: { accuracy: 85 },
    },

    // Логопедические упражнения
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
      title: 'Артикуляционная гимнастика',
      slug: 'articulation-gymnastics',
      description: 'Комплекс упражнений для органов артикуляции',
      category: 'speech',
      ageMin: 3,
      ageMax: 8,
      difficulty: 'beginner',
      durationMinutes: 15,
      materials: { items: ['Зеркало', 'Карточки с упражнениями'] },
      instructions: {
        steps: [
          'Перед зеркалом показать упражнения для языка',
          'Выполнить вместе с ребенком',
          'Повторить 5-7 раз каждое',
        ],
      },
      successCriteria: { executionQuality: 75 },
    },
    {
      title: 'Называем предметы',
      slug: 'naming-objects',
      description: 'Расширение словарного запаса через называние предметов',
      category: 'speech',
      ageMin: 2,
      ageMax: 6,
      difficulty: 'beginner',
      durationMinutes: 20,
      materials: { items: ['Карточки с предметами', 'Реальные объекты'] },
      instructions: {
        steps: [
          'Показывать предмет или картинку',
          'Четко называть предмет',
          'Просить ребенка повторить',
        ],
      },
      successCriteria: { newWords: 10 },
    },
    {
      title: 'Слоговая структура слова',
      slug: 'syllable-structure',
      description: 'Работа над слоговой структурой и ритмом',
      category: 'speech',
      ageMin: 4,
      ageMax: 8,
      difficulty: 'intermediate',
      durationMinutes: 20,
      materials: { items: ['Карточки со словами', 'Музыкальные инструменты'] },
      instructions: {
        steps: [
          'Произносить слово по слогам',
          'Отхлопывать ритм',
          'Просить ребенка повторить',
        ],
      },
      successCriteria: { accuracy: 80 },
    },

    // Моторные упражнения
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
    {
      title: 'Собери бусы',
      slug: 'string-beads',
      description: 'Нанизывание бусин для развития мелкой моторики',
      category: 'motor',
      ageMin: 3,
      ageMax: 7,
      difficulty: 'beginner',
      durationMinutes: 20,
      materials: { items: ['Бусины разных цветов', 'Шнурок'] },
      instructions: {
        steps: [
          'Показать, как нанизывать бусины',
          'Создать узор по образцу',
          'Поощрять самостоятельность',
        ],
      },
      successCriteria: { beadsStrung: 10, accuracy: 80 },
    },
    {
      title: 'Лепка из пластилина',
      slug: 'clay-modeling',
      description: 'Развитие моторики и креативности через лепку',
      category: 'motor',
      ageMin: 3,
      ageMax: 8,
      difficulty: 'intermediate',
      durationMinutes: 30,
      materials: { items: ['Пластилин', 'Доска для лепки', 'Стеки'] },
      instructions: {
        steps: [
          'Размять пластилин',
          'Показать базовые формы',
          'Создать простую фигуру',
        ],
      },
      successCriteria: { completedWork: true },
    },

    // Социально-эмоциональные упражнения
    {
      title: 'Эмоции на лицах',
      slug: 'emotions-on-faces',
      description: 'Распознавание и называние эмоций',
      category: 'social',
      ageMin: 3,
      ageMax: 8,
      difficulty: 'beginner',
      durationMinutes: 20,
      materials: { items: ['Карточки с лицами', 'Зеркало'] },
      instructions: {
        steps: [
          'Показать карточку с эмоцией',
          'Назвать эмоцию',
          'Попросить показать эмоцию в зеркале',
        ],
      },
      successCriteria: { recognitionRate: 75 },
    },
    {
      title: 'Совместная игра',
      slug: 'cooperative-play',
      description: 'Развитие навыков взаимодействия и сотрудничества',
      category: 'social',
      ageMin: 4,
      ageMax: 10,
      difficulty: 'intermediate',
      durationMinutes: 30,
      materials: { items: ['Конструктор', 'Мяч', 'Настольная игра'] },
      instructions: {
        steps: [
          'Предложить совместную игру',
          'Объяснить правила взаимодействия',
          'Поощрять сотрудничество',
        ],
      },
      successCriteria: { cooperationLevel: 70 },
    },

    // Сенсорные упражнения
    {
      title: 'Сенсорная коробка',
      slug: 'sensory-bin',
      description: 'Тактильная стимуляция через различные материалы',
      category: 'sensory',
      ageMin: 2,
      ageMax: 6,
      difficulty: 'beginner',
      durationMinutes: 20,
      materials: { items: ['Коробка', 'Крупы', 'Мелкие игрушки', 'Камешки'] },
      instructions: {
        steps: [
          'Наполнить коробку разными материалами',
          'Искать спрятанные предметы',
          'Описывать ощущения',
        ],
      },
      successCriteria: { engagement: 80 },
    },
    {
      title: 'Различаем текстуры',
      slug: 'texture-discrimination',
      description: 'Развитие тактильного восприятия',
      category: 'sensory',
      ageMin: 3,
      ageMax: 7,
      difficulty: 'beginner',
      durationMinutes: 15,
      materials: { items: ['Образцы тканей', 'Предметы разной текстуры', 'Повязка на глаза'] },
      instructions: {
        steps: [
          'Дать потрогать разные текстуры',
          'Описать ощущения',
          'Найти пару на ощупь',
        ],
      },
      successCriteria: { accuracy: 70 },
    },
  ];

  const createdExercises = [];
  for (const ex of exercises) {
    const created = await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: {},
      create: ex,
    });
    createdExercises.push(created);
  }

  console.log(`✅ Проверено/создано упражнений: ${exercises.length}`);

  // ============================================================
  // 7. Создаём шаблоны маршрутов (реляционная структура)
  // ============================================================

  console.log('📝 Создание шаблонов маршрутов...');

  // Шаблон 1: Комплексный коррекционный маршрут (3-6 лет)
  const template1 = await prisma.routeTemplate.create({
    data: {
      title: 'Комплексный коррекционный маршрут 3-6 лет',
      description: 'Универсальный шаблон для детей 3-6 лет с задержкой развития.',
      targetAgeRange: '3-6',
      severityLevel: 'moderate',
      version: 1,
      status: 'published',
      publishedAt: new Date(),
    },
  });

  // Фазы для шаблона 1
  const t1Phase1 = await prisma.templatePhase.create({
    data: {
      templateId: template1.id,
      name: 'Диагностика и адаптация',
      description: 'Начальная оценка и привыкание к занятиям',
      orderIndex: 1,
      durationWeeks: 2,
      specialtyHint: 'neuropsychologist',
    },
  });

  const t1Phase2 = await prisma.templatePhase.create({
    data: {
      templateId: template1.id,
      name: 'Базовые навыки',
      description: 'Формирование основных когнитивных и моторных навыков',
      orderIndex: 2,
      durationWeeks: 8,
      specialtyHint: 'neuropsychologist',
    },
  });

  const t1Phase3 = await prisma.templatePhase.create({
    data: {
      templateId: template1.id,
      name: 'Развитие',
      description: 'Углубленная работа над речью и социальными навыками',
      orderIndex: 3,
      durationWeeks: 10,
      specialtyHint: 'speech_therapist',
    },
  });

  await prisma.templatePhase.create({
    data: {
      templateId: template1.id,
      name: 'Закрепление',
      description: 'Закрепление навыков и подготовка к завершению',
      orderIndex: 4,
      durationWeeks: 4,
      specialtyHint: 'neuropsychologist',
    },
  });

  // Цели для шаблона 1
  await prisma.templateGoal.create({
    data: {
      templateId: template1.id,
      templatePhaseId: t1Phase2.id,
      category: 'cognitive',
      goalType: 'skill',
      description: 'Развитие базовых когнитивных функций',
      targetMetric: 'Успешность выполнения заданий',
      measurementUnit: 'процент',
      baselineGuideline: 'Начальная оценка 30-50%',
      targetGuideline: 'Целевой показатель 75-85%',
      priority: 'high',
    },
  });

  await prisma.templateGoal.create({
    data: {
      templateId: template1.id,
      templatePhaseId: t1Phase3.id,
      category: 'speech',
      goalType: 'skill',
      description: 'Расширение словарного запаса',
      targetMetric: 'Количество слов',
      measurementUnit: 'слов',
      baselineGuideline: 'Базовый уровень 50-100 слов',
      targetGuideline: 'Целевой уровень 150-200 слов',
      priority: 'high',
    },
  });

  // Контрольные точки для шаблона 1
  await prisma.templateMilestone.create({
    data: {
      templatePhaseId: t1Phase1.id,
      title: 'Завершение диагностики',
      description: 'Полная оценка всех областей развития',
      checkpointType: 'assessment',
      dueWeek: 2,
      successCriteria: 'Составлен полный профиль ребенка',
    },
  });

  // Шаблон 2: Логопедический интенсив
  const template2 = await prisma.routeTemplate.create({
    data: {
      title: 'Логопедический интенсив',
      description: 'Интенсивная программа для коррекции речевых нарушений.',
      targetAgeRange: '4-8',
      severityLevel: 'mild_to_moderate',
      version: 1,
      status: 'published',
      publishedAt: new Date(),
    },
  });

  const t2Phase1 = await prisma.templatePhase.create({
    data: {
      templateId: template2.id,
      name: 'Подготовительный',
      description: 'Подготовка артикуляционного аппарата',
      orderIndex: 1,
      durationWeeks: 2,
      specialtyHint: 'speech_therapist',
    },
  });

  await prisma.templatePhase.create({
    data: {
      templateId: template2.id,
      name: 'Постановка звуков',
      description: 'Работа над постановкой отсутствующих звуков',
      orderIndex: 2,
      durationWeeks: 6,
      specialtyHint: 'speech_therapist',
    },
  });

  await prisma.templatePhase.create({
    data: {
      templateId: template2.id,
      name: 'Автоматизация',
      description: 'Закрепление звуков в слогах, словах, фразах',
      orderIndex: 3,
      durationWeeks: 6,
      specialtyHint: 'speech_therapist',
    },
  });

  await prisma.templatePhase.create({
    data: {
      templateId: template2.id,
      name: 'Интеграция в речь',
      description: 'Использование звуков в спонтанной речи',
      orderIndex: 4,
      durationWeeks: 2,
      specialtyHint: 'speech_therapist',
    },
  });

  await prisma.templateGoal.create({
    data: {
      templateId: template2.id,
      templatePhaseId: t2Phase1.id,
      category: 'speech',
      goalType: 'skill',
      description: 'Улучшение артикуляционной моторики',
      targetMetric: 'Качество выполнения упражнений',
      measurementUnit: 'процент',
      baselineGuideline: 'Базовый уровень 40-60%',
      targetGuideline: 'Целевой уровень 85-95%',
      priority: 'high',
    },
  });

  // Шаблон 3: Сенсорная интеграция
  const template3 = await prisma.routeTemplate.create({
    data: {
      title: 'Программа сенсорной интеграции',
      description: 'Программа для детей с нарушениями сенсорной обработки.',
      targetAgeRange: '2-8',
      severityLevel: 'varies',
      version: 1,
      status: 'published',
      publishedAt: new Date(),
    },
  });

  const t3Phase1 = await prisma.templatePhase.create({
    data: {
      templateId: template3.id,
      name: 'Оценка и адаптация',
      description: 'Сенсорный профиль и план вмешательства',
      orderIndex: 1,
      durationWeeks: 2,
      specialtyHint: 'occupational',
    },
  });

  await prisma.templatePhase.create({
    data: {
      templateId: template3.id,
      name: 'Тактильная стимуляция',
      description: 'Работа с тактильными ощущениями',
      orderIndex: 2,
      durationWeeks: 6,
      specialtyHint: 'occupational',
    },
  });

  await prisma.templatePhase.create({
    data: {
      templateId: template3.id,
      name: 'Вестибулярная система',
      description: 'Упражнения на равновесие и координацию',
      orderIndex: 3,
      durationWeeks: 6,
      specialtyHint: 'occupational',
    },
  });

  await prisma.templatePhase.create({
    data: {
      templateId: template3.id,
      name: 'Проприоцепция',
      description: 'Осознание тела в пространстве',
      orderIndex: 4,
      durationWeeks: 4,
      specialtyHint: 'occupational',
    },
  });

  await prisma.templatePhase.create({
    data: {
      templateId: template3.id,
      name: 'Интеграция',
      description: 'Объединение всех сенсорных систем',
      orderIndex: 5,
      durationWeeks: 2,
      specialtyHint: 'occupational',
    },
  });

  await prisma.templateGoal.create({
    data: {
      templateId: template3.id,
      templatePhaseId: t3Phase1.id,
      category: 'sensory',
      goalType: 'behaviour',
      description: 'Улучшение сенсорной регуляции',
      targetMetric: 'Количество сенсорных срывов в день',
      measurementUnit: 'эпизодов',
      baselineGuideline: 'Базовый уровень 5-10 эпизодов',
      targetGuideline: 'Целевой уровень 1-2 эпизода',
      priority: 'high',
    },
  });

  // Связи упражнений с фазами шаблонов (TemplateExercise)
  const speechExerciseTemplate = createdExercises.find(e => e.slug === 'articulation-gymnastics')!;
  const cognitiveExerciseTemplate = createdExercises.find(e => e.slug === 'sorting-by-colors')!;
  const motorExerciseTemplate = createdExercises.find(e => e.slug === 'finger-gymnastics')!;

  // Упражнения для шаблона 1
  await prisma.templateExercise.create({
    data: {
      templatePhaseId: t1Phase2.id,
      exerciseId: cognitiveExerciseTemplate.id,
      orderIndex: 1,
      frequencyPerWeek: 3,
      durationMinutes: 15,
      notes: 'Начинать с простых заданий',
    },
  });

  await prisma.templateExercise.create({
    data: {
      templatePhaseId: t1Phase3.id,
      exerciseId: speechExerciseTemplate.id,
      orderIndex: 1,
      frequencyPerWeek: 5,
      durationMinutes: 10,
      notes: 'Ежедневная артикуляционная гимнастика',
    },
  });

  // Упражнения для шаблона 2
  await prisma.templateExercise.create({
    data: {
      templatePhaseId: t2Phase1.id,
      exerciseId: speechExerciseTemplate.id,
      orderIndex: 1,
      frequencyPerWeek: 7,
      durationMinutes: 15,
      notes: 'Интенсивная подготовка артикуляционного аппарата',
    },
  });

  // Упражнения для шаблона 3
  await prisma.templateExercise.create({
    data: {
      templatePhaseId: t3Phase1.id,
      exerciseId: motorExerciseTemplate.id,
      orderIndex: 1,
      frequencyPerWeek: 4,
      durationMinutes: 10,
      notes: 'Мелкая моторика для тактильной стимуляции',
    },
  });

  console.log('✅ Создано шаблонов: 3 с фазами, целями, контрольными точками и упражнениями');

  // ============================================================
  // 8. Создаём маршруты
  // ============================================================

  console.log('📝 Создание маршрутов...');

  // Маршрут для ребенка 1 (Алиса) - активный
  const route1 = await prisma.route.create({
    data: {
      childId: child1.id,
      leadSpecialistId: spec1.id,
      title: 'Комплексная коррекция - Алиса',
      summary: 'Работа над речью, моторикой и социальными навыками',
      status: 'active',
      planHorizonWeeks: 24,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2026-03-31'),
    },
  });

  // Маршрут для ребенка 2 (Борис) - draft
  const route2 = await prisma.route.create({
    data: {
      childId: child2.id,
      leadSpecialistId: spec1.id,
      title: 'Логопедическая коррекция - Борис',
      summary: 'Фокус на развитие коммуникативных навыков',
      status: 'draft',
      planHorizonWeeks: 16,
    },
  });

  console.log('✅ Создано маршрутов: 2');

  // ============================================================
  // 9. Создаём фазы маршрутов
  // ============================================================

  console.log('📝 Создание фаз маршрутов...');

  const phase1_1 = await prisma.routePhase.create({
    data: {
      routeId: route1.id,
      responsibleSpecialistId: spec1.id,
      name: 'Диагностика и адаптация',
      description: 'Начальная оценка и адаптация ребенка к занятиям',
      orderIndex: 1,
      status: 'completed',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-14'),
      durationWeeks: 2,
      expectedOutcomes: 'Полная диагностика, адаптация к процессу',
    },
  });

  const phase1_2 = await prisma.routePhase.create({
    data: {
      routeId: route1.id,
      responsibleSpecialistId: spec2.id,
      name: 'Развитие речи',
      description: 'Логопедическая коррекция и развитие речевых навыков',
      orderIndex: 2,
      status: 'active',
      startDate: new Date('2025-10-15'),
      endDate: new Date('2025-12-15'),
      durationWeeks: 8,
      expectedOutcomes: 'Улучшение артикуляции, расширение словарного запаса',
    },
  });

  const phase1_3 = await prisma.routePhase.create({
    data: {
      routeId: route1.id,
      responsibleSpecialistId: spec3.id,
      name: 'Поведенческая коррекция',
      description: 'ABA-терапия для коррекции поведения',
      orderIndex: 3,
      status: 'planned',
      durationWeeks: 10,
      expectedOutcomes: 'Снижение нежелательного поведения, новые навыки',
    },
  });

  console.log('✅ Создано фаз: 3');

  // ============================================================
  // 10. Создаём цели маршрутов
  // ============================================================

  console.log('📝 Создание целей маршрутов...');

  const goal1_1 = await prisma.routeGoal.create({
    data: {
      routeId: route1.id,
      phaseId: phase1_2.id,
      category: 'speech',
      goalType: 'skill',
      description: 'Улучшить произношение звуков Р и Л',
      targetMetric: 'Правильное произношение',
      measurementUnit: 'процент',
      baselineValue: 30,
      targetValue: 80,
      reviewPeriodWeeks: 4,
      priority: 'high',
      status: 'active',
    },
  });

  const goal1_2 = await prisma.routeGoal.create({
    data: {
      routeId: route1.id,
      phaseId: phase1_2.id,
      category: 'speech',
      goalType: 'skill',
      description: 'Расширить активный словарный запас до 200 слов',
      targetMetric: 'Количество слов',
      measurementUnit: 'слов',
      baselineValue: 100,
      targetValue: 200,
      reviewPeriodWeeks: 8,
      priority: 'high',
      status: 'active',
    },
  });

  const goal1_3 = await prisma.routeGoal.create({
    data: {
      routeId: route1.id,
      phaseId: phase1_3.id,
      category: 'behavior',
      goalType: 'behaviour',
      description: 'Уменьшить частоту аутостимуляции',
      targetMetric: 'Эпизодов в день',
      measurementUnit: 'раз',
      baselineValue: 20,
      targetValue: 5,
      reviewPeriodWeeks: 4,
      priority: 'medium',
      status: 'active',
    },
  });

  console.log('✅ Создано целей: 3');

  // ============================================================
  // 11. Создаём назначения
  // ============================================================

  console.log('📝 Создание назначений...');

  const speechExercise = createdExercises.find(e => e.slug === 'articulation-gymnastics')!;
  const cognitiveExercise = createdExercises.find(e => e.slug === 'sorting-by-colors')!;
  const motorExercise = createdExercises.find(e => e.slug === 'finger-gymnastics')!;
  const socialExercise = createdExercises.find(e => e.slug === 'emotions-on-faces')!;

  // Назначения для Алисы (разные статусы)
  // ВАЖНО: specialistId ссылается на userId (не на Specialist.id)
  // Используем актуальные даты относительно текущего времени
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  await prisma.assignment.create({
    data: {
      childId: child1.id,
      exerciseId: speechExercise.id,
      assignedById: specialist1.id,
      specialistId: specialist2.id, // userId логопеда
      routeId: route1.id,
      phaseId: phase1_2.id,
      targetGoalId: goal1_1.id,
      plannedStartDate: threeDaysAgo,
      dueDate: threeDaysAgo,
      status: 'completed',
      deliveryChannel: 'in_person',
      frequencyPerWeek: 3,
      expectedDurationMinutes: 15,
      notes: 'Отлично справился! Прогресс заметен.',
    },
  });

  await prisma.assignment.create({
    data: {
      childId: child1.id,
      exerciseId: cognitiveExercise.id,
      assignedById: specialist1.id,
      specialistId: specialist1.id, // userId нейропсихолога
      routeId: route1.id,
      phaseId: phase1_2.id,
      plannedStartDate: today,
      dueDate: today,
      status: 'in_progress',
      deliveryChannel: 'in_person',
      frequencyPerWeek: 2,
      expectedDurationMinutes: 20,
    },
  });

  await prisma.assignment.create({
    data: {
      childId: child1.id,
      exerciseId: motorExercise.id,
      assignedById: specialist1.id,
      specialistId: specialist1.id, // userId нейропсихолога
      routeId: route1.id,
      phaseId: phase1_2.id,
      plannedStartDate: tomorrow,
      dueDate: tomorrow,
      status: 'scheduled',
      deliveryChannel: 'home',
      frequencyPerWeek: 5,
      expectedDurationMinutes: 10,
      notes: 'Выполнять дома с родителями',
    },
  });

  await prisma.assignment.create({
    data: {
      childId: child1.id,
      exerciseId: socialExercise.id,
      assignedById: specialist1.id,
      specialistId: specialist3.id, // userId ABA-терапевта
      routeId: route1.id,
      phaseId: phase1_3.id,
      targetGoalId: goal1_3.id,
      plannedStartDate: dayAfterTomorrow,
      dueDate: dayAfterTomorrow,
      status: 'scheduled',
      deliveryChannel: 'in_person',
      frequencyPerWeek: 2,
      expectedDurationMinutes: 30,
    },
  });

  await prisma.assignment.create({
    data: {
      childId: child1.id,
      exerciseId: speechExercise.id,
      assignedById: specialist1.id,
      specialistId: specialist2.id, // userId логопеда
      routeId: route1.id,
      phaseId: phase1_2.id,
      targetGoalId: goal1_1.id,
      plannedStartDate: new Date('2025-10-10'),
      dueDate: new Date('2025-10-10'),
      status: 'overdue',
      deliveryChannel: 'telepractice',
      frequencyPerWeek: 3,
      expectedDurationMinutes: 15,
      notes: 'Пропущено из-за болезни',
    },
  });

  await prisma.assignment.create({
    data: {
      childId: child1.id,
      exerciseId: motorExercise.id,
      assignedById: specialist1.id,
      specialistId: specialist1.id, // userId нейропсихолога
      routeId: route1.id,
      phaseId: phase1_2.id,
      plannedStartDate: yesterday,
      dueDate: yesterday,
      status: 'cancelled',
      deliveryChannel: 'in_person',
      frequencyPerWeek: 2,
      expectedDurationMinutes: 10,
      notes: 'Отменено по просьбе родителей',
    },
  });

  await prisma.assignment.create({
    data: {
      childId: child2.id,
      exerciseId: speechExercise.id,
      assignedById: specialist1.id,
      specialistId: specialist2.id, // userId логопеда
      routeId: route2.id,
      phaseId: phase1_2.id,
      plannedStartDate: tomorrow,
      dueDate: tomorrow,
      status: 'scheduled',
      deliveryChannel: 'in_person',
      frequencyPerWeek: 3,
      expectedDurationMinutes: 15,
    },
  });

  await prisma.assignment.create({
    data: {
      childId: child2.id,
      exerciseId: socialExercise.id,
      assignedById: specialist1.id,
      specialistId: specialist1.id, // userId нейропсихолога
      routeId: route2.id,
      phaseId: phase1_2.id,
      plannedStartDate: dayAfterTomorrow,
      dueDate: dayAfterTomorrow,
      status: 'scheduled',
      deliveryChannel: 'home',
      frequencyPerWeek: 2,
      expectedDurationMinutes: 20,
    },
  });

  console.log('✅ Создано назначений: 8');

  // ============================================================
  // 12. Создаём уведомления (Notifications)
  // ============================================================

  console.log('📝 Создание уведомлений...');

  // Notification 1: Email reminder для parent1
  const notification1 = await prisma.notification.create({
    data: {
      recipientId: parent1.id,
      channel: 'email',
      template: 'assignment_reminder',
      payload: {
        subject: 'Напоминание о занятии',
        body: 'Через 1 час начинается занятие "Развитие внимания"',
        assignmentId: assignment1.id,
      },
      status: 'sent',
      attempts: 1,
      scheduledAt: new Date('2025-11-20T08:00:00Z'),
      sentAt: new Date('2025-11-20T08:00:15Z'),
    },
  });

  // Notification 2: Push notification для parent1
  const notification2 = await prisma.notification.create({
    data: {
      recipientId: parent1.id,
      channel: 'push',
      template: 'report_reviewed',
      payload: {
        title: 'Отчет проверен',
        body: 'Специалист оставил комментарий к отчету',
        reportId: 'mock-report-id',
      },
      status: 'sent',
      attempts: 1,
      scheduledAt: new Date('2025-11-21T14:30:00Z'),
      sentAt: new Date('2025-11-21T14:30:05Z'),
    },
  });

  // Notification 3: Failed email для parent2
  const notification3 = await prisma.notification.create({
    data: {
      recipientId: parent2.id,
      channel: 'email',
      template: 'goal_achieved',
      payload: {
        subject: 'Достижение цели',
        body: 'Ваш ребенок достиг цели "Называть 5 цветов"',
        goalId: goal1.id,
      },
      status: 'failed',
      attempts: 3,
      lastError: 'SMTP Error: Connection timeout',
      scheduledAt: new Date('2025-11-22T10:00:00Z'),
    },
  });

  // Notification 4: Pending notification для parent1
  await prisma.notification.create({
    data: {
      recipientId: parent1.id,
      channel: 'email',
      template: 'route_updated',
      payload: {
        subject: 'Обновление маршрута',
        body: 'Специалист обновил маршрут вашего ребенка',
        routeId: route1.id,
      },
      status: 'pending',
      attempts: 0,
      scheduledAt: new Date(Date.now() + 3600000), // Через 1 час
    },
  });

  console.log('✅ Создано уведомлений: 4');

  // ============================================================
  // 13. Создаём in-app уведомления (UserNotifications)
  // ============================================================

  console.log('📝 Создание in-app уведомлений...');

  // UserNotification 1: Непрочитанное для parent1
  await prisma.userNotification.create({
    data: {
      userId: parent1.id,
      notificationId: notification1.id,
      type: 'assignment_reminder',
      title: 'Напоминание о занятии',
      body: 'Через 1 час начинается занятие "Развитие внимания"',
      link: `/dashboard/assignments/${assignment1.id}`,
      status: 'unread',
    },
  });

  // UserNotification 2: Прочитанное для parent1
  await prisma.userNotification.create({
    data: {
      userId: parent1.id,
      notificationId: notification2.id,
      type: 'report_reviewed',
      title: 'Отчет проверен',
      body: 'Специалист Анна Смирнова оставила комментарий к отчету',
      link: '/dashboard/reports/mock-report-id',
      status: 'read',
      readAt: new Date('2025-11-21T15:00:00Z'),
    },
  });

  // UserNotification 3: System message для parent1 (без связи с Notification)
  await prisma.userNotification.create({
    data: {
      userId: parent1.id,
      type: 'system_message',
      title: 'Добро пожаловать в Neiro Platform',
      body: 'Ознакомьтесь с нашим руководством для родителей',
      link: '/help/guide',
      status: 'unread',
    },
  });

  // UserNotification 4: Goal achieved для parent2
  await prisma.userNotification.create({
    data: {
      userId: parent2.id,
      type: 'goal_achieved',
      title: 'Цель достигнута!',
      body: 'Ваш ребенок успешно достиг цели "Называть 5 цветов"',
      link: `/dashboard/goals/${goal1.id}`,
      status: 'unread',
    },
  });

  // UserNotification 5: Archived для parent1
  await prisma.userNotification.create({
    data: {
      userId: parent1.id,
      type: 'route_updated',
      title: 'Маршрут обновлен',
      body: 'Специалист внес изменения в маршрут',
      link: `/dashboard/routes/${route1.id}`,
      status: 'archived',
      readAt: new Date('2025-11-19T12:00:00Z'),
    },
  });

  console.log('✅ Создано in-app уведомлений: 5');

  // ============================================================
  // 14. Создаём настройки уведомлений (NotificationPreferences)
  // ============================================================

  console.log('📝 Создание настроек уведомлений...');

  // Preferences для parent1: Все каналы включены
  await prisma.notificationPreference.create({
    data: {
      userId: parent1.id,
      preferences: {
        assignment_reminder: { email: true, push: true, inApp: true },
        report_reviewed: { email: true, push: true, inApp: true },
        goal_achieved: { email: true, push: true, inApp: true },
        route_updated: { email: true, push: false, inApp: true },
        system_message: { email: false, push: false, inApp: true },
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
        timezone: 'Asia/Tashkent',
      },
    },
  });

  // Preferences для parent2: Только email
  await prisma.notificationPreference.create({
    data: {
      userId: parent2.id,
      preferences: {
        assignment_reminder: { email: true, push: false, inApp: true },
        report_reviewed: { email: true, push: false, inApp: true },
        goal_achieved: { email: true, push: false, inApp: false },
        route_updated: { email: false, push: false, inApp: true },
      },
      quietHours: null,
    },
  });

  // Preferences для specialist1: Push disabled
  await prisma.notificationPreference.create({
    data: {
      userId: specialist1.id,
      preferences: {
        assignment_reminder: { email: true, push: false, inApp: true },
        report_reviewed: { email: true, push: false, inApp: true },
        goal_achieved: { email: false, push: false, inApp: true },
        new_assignment: { email: true, push: false, inApp: true },
      },
    },
  });

  console.log('✅ Создано настроек уведомлений: 3');

  // ============================================================
  // 15. Создаём диагностические сессии
  // ============================================================

  console.log('📝 Создание диагностических сессий...');

  await prisma.diagnosticSession.create({
    data: {
      childId: child1.id,
      performedBy: specialist1.id,
      questionnaireCode: 'CARS',
      status: 'completed',
      startedAt: new Date('2025-10-01T10:00:00Z'),
      completedAt: new Date('2025-10-01T11:30:00Z'),
      scoreTotal: 32,
      scoreRaw: {
        items: [
          { questionId: 1, answer: 3, notes: 'Умеренные трудности' },
          { questionId: 2, answer: 2, notes: 'Легкие отклонения' },
        ],
      },
      interpretationLevel: 'moderate_risk',
      notes: 'Начальная диагностика. Ребенок сотрудничал хорошо.',
    },
  });

  await prisma.diagnosticSession.create({
    data: {
      childId: child2.id,
      performedBy: specialist1.id,
      questionnaireCode: 'M-CHAT',
      status: 'in_progress',
      startedAt: new Date('2025-11-15T14:00:00Z'),
      scoreRaw: {
        items: [
          { questionId: 1, answer: 'yes' },
          { questionId: 2, answer: 'no' },
        ],
      },
    },
  });

  console.log('✅ Создано диагностических сессий: 2');

  console.log('');
  console.log('🎉 Seed завершен успешно!');
  console.log('');
  console.log('📋 Тестовые учетные данные:');
  console.log('   Admin:          admin@neiro.dev / admin123');
  console.log('   Supervisor:     supervisor@neiro.dev / supervisor123');
  console.log('   Specialist 1:   specialist1@example.com / admin123 (Нейропсихолог)');
  console.log('   Specialist 2:   specialist2@example.com / admin123 (Логопед)');
  console.log('   Specialist 3:   specialist3@example.com / admin123 (ABA-терапевт)');
  console.log('   Parent 1:       parent1@example.com / parent123');
  console.log('   Parent 2-10:    parent2-10@example.com / parent123');
  console.log('');
  console.log('📬 Уведомления (Month 3 features):');
  console.log('   - 4 Notifications (sent, failed, pending)');
  console.log('   - 5 UserNotifications (unread, read, archived)');
  console.log('   - 3 NotificationPreferences (parent1, parent2, specialist1)');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

