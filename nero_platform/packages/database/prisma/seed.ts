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
    const created = await prisma.exercise.create({ data: ex });
    createdExercises.push(created);
  }

  console.log(`✅ Создано упражнений: ${exercises.length}`);

  // ============================================================
  // 7. Создаём шаблоны маршрутов
  // ============================================================

  console.log('📝 Создание шаблонов маршрутов...');

  // Шаблон 1: Комплексный коррекционный маршрут (3-6 лет)
  const template1 = await prisma.routeTemplate.create({
    data: {
      title: 'Комплексный коррекционный маршрут 3-6 лет',
      slug: 'comprehensive-correction-3-6',
      description: 'Универсальный шаблон для детей 3-6 лет с задержкой развития. Включает работу по всем направлениям: когнитивное, речевое, моторное развитие.',
      ageMin: 3,
      ageMax: 6,
      targetAudience: 'Дети с задержкой психоречевого развития',
      durationWeeks: 24,
      phasesStructure: {
        phases: [
          { name: 'Диагностика и адаптация', weeks: 2 },
          { name: 'Базовые навыки', weeks: 8 },
          { name: 'Развитие', weeks: 10 },
          { name: 'Закрепление', weeks: 4 },
        ],
      },
      tags: ['комплексный', 'дошкольники', 'ЗПРР'],
      status: 'published',
    },
  });

  // Добавляем фазы к шаблону 1
  const template1Phase1 = await prisma.routeTemplatePhase.create({
    data: {
      templateId: template1.id,
      orderIndex: 0,
      title: 'Диагностика и адаптация',
      description: 'Первичная диагностика, адаптация к специалистам',
      durationWeeks: 2,
      objectives: {
        items: [
          'Провести комплексную диагностику',
          'Установить контакт с ребенком',
          'Определить базовый уровень навыков',
        ],
      },
    },
  });

  await prisma.routeTemplatePhaseGoal.createMany({
    data: [
      {
        phaseId: template1Phase1.id,
        orderIndex: 0,
        title: 'Установление контакта',
        domain: 'social',
        description: 'Ребенок комфортно чувствует себя со специалистом',
        successCriteria: { cooperationLevel: 80 },
      },
      {
        phaseId: template1Phase1.id,
        orderIndex: 1,
        title: 'Первичная диагностика',
        domain: 'cognitive',
        description: 'Проведена оценка когнитивных функций',
        successCriteria: { assessmentCompleted: true },
      },
    ],
  });

  const template1Phase2 = await prisma.routeTemplatePhase.create({
    data: {
      templateId: template1.id,
      orderIndex: 1,
      title: 'Базовые навыки',
      description: 'Формирование базовых когнитивных и коммуникативных навыков',
      durationWeeks: 8,
      objectives: {
        items: [
          'Развить базовые когнитивные навыки',
          'Расширить понимаемую речь',
          'Улучшить моторику',
        ],
      },
    },
  });

  await prisma.routeTemplatePhaseGoal.createMany({
    data: [
      {
        phaseId: template1Phase2.id,
        orderIndex: 0,
        title: 'Понимание инструкций',
        domain: 'cognitive',
        description: 'Ребенок понимает и выполняет простые инструкции',
        successCriteria: { accuracy: 75 },
      },
      {
        phaseId: template1Phase2.id,
        orderIndex: 1,
        title: 'Словарный запас',
        domain: 'speech',
        description: 'Расширение активного словаря до 50 слов',
        successCriteria: { wordCount: 50 },
      },
      {
        phaseId: template1Phase2.id,
        orderIndex: 2,
        title: 'Мелкая моторика',
        domain: 'motor',
        description: 'Улучшение координации пальцев',
        successCriteria: { motorSkillLevel: 'age-appropriate' },
      },
    ],
  });

  // Шаблон 2: Логопедический интенсив
  const template2 = await prisma.routeTemplate.create({
    data: {
      title: 'Логопедический интенсив',
      slug: 'speech-intensive',
      description: 'Интенсивная программа для коррекции речевых нарушений. Фокус на артикуляции, фонематическом слухе и расширении словаря.',
      ageMin: 4,
      ageMax: 8,
      targetAudience: 'Дети с нарушениями речи (дизартрия, дислалия, ОНР)',
      durationWeeks: 16,
      phasesStructure: {
        phases: [
          { name: 'Подготовительный', weeks: 2 },
          { name: 'Постановка звуков', weeks: 6 },
          { name: 'Автоматизация', weeks: 6 },
          { name: 'Интеграция в речь', weeks: 2 },
        ],
      },
      tags: ['логопедия', 'речь', 'интенсив'],
      status: 'published',
    },
  });

  const template2Phase1 = await prisma.routeTemplatePhase.create({
    data: {
      templateId: template2.id,
      orderIndex: 0,
      title: 'Подготовительный этап',
      description: 'Артикуляционная гимнастика, развитие фонематического слуха',
      durationWeeks: 2,
      objectives: {
        items: [
          'Подготовить артикуляционный аппарат',
          'Развить фонематический слух',
          'Дыхательная гимнастика',
        ],
      },
    },
  });

  await prisma.routeTemplatePhaseGoal.create({
    data: {
      phaseId: template2Phase1.id,
      orderIndex: 0,
      title: 'Артикуляционная готовность',
      domain: 'speech',
      description: 'Органы артикуляции готовы к постановке звуков',
      successCriteria: { articulationQuality: 80 },
    },
  });

  // Шаблон 3: Сенсорная интеграция
  const template3 = await prisma.routeTemplate.create({
    data: {
      title: 'Программа сенсорной интеграции',
      slug: 'sensory-integration',
      description: 'Программа для детей с нарушениями сенсорной обработки. Работа с тактильной, вестибулярной и проприоцептивной системами.',
      ageMin: 2,
      ageMax: 8,
      targetAudience: 'Дети с нарушениями сенсорной интеграции, РАС, СДВГ',
      durationWeeks: 20,
      phasesStructure: {
        phases: [
          { name: 'Оценка и адаптация', weeks: 2 },
          { name: 'Тактильная стимуляция', weeks: 6 },
          { name: 'Вестибулярная система', weeks: 6 },
          { name: 'Проприоцепция', weeks: 4 },
          { name: 'Интеграция', weeks: 2 },
        ],
      },
      tags: ['сенсорика', 'РАС', 'СДВГ'],
      status: 'published',
    },
  });

  console.log('✅ Создано шаблонов: 3');

  // ============================================================
  // 8. Создаём тестовые маршруты и назначения
  // ============================================================

  console.log('📝 Создание тестовых маршрутов...');

  // Создаем маршрут для Алисы
  const route1 = await prisma.route.create({
    data: {
      childId: child1.id,
      leadSpecialistId: neuroSpecialist.id,
      templateId: template1.id,
      title: 'Индивидуальный маршрут Алисы',
      summary: 'Комплексная программа коррекции ЗПРР',
      status: 'active',
      planHorizonWeeks: 24,
      startDate: new Date('2025-11-01'),
    },
  });

  // Добавляем цели к маршруту
  await prisma.routeGoal.createMany({
    data: [
      {
        routeId: route1.id,
        orderIndex: 0,
        title: 'Развитие речи',
        domain: 'speech',
        description: 'Расширение активного словаря до 100 слов',
        priority: 'high',
        targetDate: new Date('2026-05-01'),
        successCriteria: { wordCount: 100 },
        status: 'active',
      },
      {
        routeId: route1.id,
        orderIndex: 1,
        title: 'Когнитивное развитие',
        domain: 'cognitive',
        description: 'Формирование базовых когнитивных операций',
        priority: 'high',
        targetDate: new Date('2026-05-01'),
        successCriteria: { skillLevel: 'age-appropriate' },
        status: 'active',
      },
    ],
  });

  // Создаем маршрут для Тимура
  const route2 = await prisma.route.create({
    data: {
      childId: child2.id,
      leadSpecialistId: speechSpecialist.id,
      templateId: template2.id,
      title: 'Логопедическая коррекция Тимура',
      summary: 'Постановка звуков [Р], [Л], автоматизация',
      status: 'active',
      planHorizonWeeks: 16,
      startDate: new Date('2025-11-15'),
    },
  });

  console.log('✅ Создано маршрутов: 2');

  // ============================================================
  // 9. Создаём тестовые назначения
  // ============================================================

  console.log('📝 Создание тестовых назначений...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(14, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(11, 0, 0, 0);

  const assignments = await prisma.assignment.createMany({
    data: [
      {
        routeId: route1.id,
        childId: child1.id,
        specialistId: neuroSpecialist.id,
        exerciseId: createdExercises[0].id, // Сортировка по цветам
        title: 'Занятие: Сортировка по цветам',
        description: 'Развитие когнитивных навыков через сортировку',
        scheduledFor: tomorrow,
        durationMinutes: 15,
        status: 'scheduled',
        location: 'Кабинет 1',
      },
      {
        routeId: route1.id,
        childId: child1.id,
        specialistId: speechSpecialist.id,
        exerciseId: createdExercises[4].id, // Повторение звуков
        title: 'Занятие: Повторение звуков',
        description: 'Развитие фонематического слуха',
        scheduledFor: tomorrow,
        durationMinutes: 10,
        status: 'scheduled',
        location: 'Кабинет 2',
      },
      {
        routeId: route1.id,
        childId: child1.id,
        specialistId: neuroSpecialist.id,
        exerciseId: createdExercises[1].id, // Найди пару
        title: 'Занятие: Найди пару',
        description: 'Развитие памяти и внимания',
        scheduledFor: dayAfter,
        durationMinutes: 20,
        status: 'scheduled',
        location: 'Кабинет 1',
      },
      {
        routeId: route2.id,
        childId: child2.id,
        specialistId: speechSpecialist.id,
        exerciseId: createdExercises[5].id, // Артикуляционная гимнастика
        title: 'Занятие: Артикуляционная гимнастика',
        description: 'Подготовка к постановке звуков',
        scheduledFor: nextWeek,
        durationMinutes: 15,
        status: 'scheduled',
        location: 'Кабинет 2',
      },
      {
        routeId: route1.id,
        childId: child1.id,
        specialistId: neuroSpecialist.id,
        exerciseId: createdExercises[8].id, // Пальчиковая гимнастика
        title: 'Домашнее задание: Пальчиковая гимнастика',
        description: 'Ежедневное выполнение дома',
        scheduledFor: tomorrow,
        durationMinutes: 10,
        status: 'scheduled',
        location: 'Дома',
        isHomework: true,
      },
    ],
  });

  console.log(`✅ Создано назначений: ${assignments.count}`);

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

