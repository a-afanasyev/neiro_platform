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

  // Используем findFirst + create или просто проверяем наличие
  let child1 = await prisma.child.findFirst({
    where: {
      firstName: 'Артем',
      lastName: 'Иванов',
      birthDate: new Date('2018-05-15'),
    },
  });

  if (!child1) {
    child1 = await prisma.child.create({
      data: {
        firstName: 'Артем',
        lastName: 'Иванов',
        birthDate: new Date('2018-05-15'),
        gender: 'male',
        diagnosisSummary: 'РАС, средняя степень тяжести, задержка речевого развития',
        notes: 'Любит конструкторы, избегает громких звуков',
      },
    });
  }

  let child2 = await prisma.child.findFirst({
    where: {
      firstName: 'София',
      lastName: 'Петрова',
      birthDate: new Date('2019-11-20'),
    },
  });

  if (!child2) {
    child2 = await prisma.child.create({
      data: {
        firstName: 'София',
        lastName: 'Петрова',
        birthDate: new Date('2019-11-20'),
        gender: 'female',
        diagnosisSummary: 'РАС легкой степени, коммуникативные трудности',
        notes: 'Интересуется рисованием, хорошо воспринимает визуальные подсказки',
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

  console.log(`✅ Связей детей с родителями: 2`);

  // ============================================================
  // 5. Назначаем специалистов детям
  // ============================================================

  console.log('📝 Назначение специалистов...');

  // Ребенок 1: команда из нейропсихолога, логопеда, ABA
  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId: {
        childId: child1.id,
        specialistId: neuroSpecialist.id,
      },
    },
    update: {},
    create: {
      childId: child1.id,
      specialistId: neuroSpecialist.id,
      specialization: 'lead',
      isPrimary: true,
      roleDescription: 'Ведущий специалист, координация маршрута',
    },
  });

  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId: {
        childId: child1.id,
        specialistId: speechSpecialist.id,
      },
    },
    update: {},
    create: {
      childId: child1.id,
      specialistId: speechSpecialist.id,
      specialization: 'speech',
      isPrimary: false,
      roleDescription: 'Коррекция речевого развития',
    },
  });

  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId: {
        childId: child1.id,
        specialistId: abaSpecialist.id,
      },
    },
    update: {},
    create: {
      childId: child1.id,
      specialistId: abaSpecialist.id,
      specialization: 'aba',
      isPrimary: false,
      roleDescription: 'Поведенческая терапия',
    },
  });

  // Ребенок 2: нейропсихолог + логопед
  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId: {
        childId: child2.id,
        specialistId: neuroSpecialist.id,
      },
    },
    update: {},
    create: {
      childId: child2.id,
      specialistId: neuroSpecialist.id,
      specialization: 'lead',
      isPrimary: true,
      roleDescription: 'Ведущий специалист',
    },
  });

  await prisma.childSpecialist.upsert({
    where: {
      childId_specialistId: {
        childId: child2.id,
        specialistId: speechSpecialist.id,
      },
    },
    update: {},
    create: {
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
    const created = await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: {},
      create: ex,
    });
    createdExercises.push(created);
  }

  console.log(`✅ Проверено/создано упражнений: ${exercises.length}`);

  // ============================================================
  // 7. Создаём шаблоны маршрутов (упрощенная версия)
  // ============================================================

  console.log('📝 Создание шаблонов маршрутов...');

  // Шаблон 1: Комплексный коррекционный маршрут (3-6 лет)
  await prisma.routeTemplate.upsert({
    where: { slug: 'comprehensive-correction-3-6' },
    update: {},
    create: {
      name: 'Комплексный коррекционный маршрут 3-6 лет',
      slug: 'comprehensive-correction-3-6',
      description: 'Универсальный шаблон для детей 3-6 лет с задержкой развития.',
      ageMin: 3,
      ageMax: 6,
      durationWeeks: 24,
      phases: {
        phases: [
          { name: 'Диагностика и адаптация', weeks: 2 },
          { name: 'Базовые навыки', weeks: 8 },
          { name: 'Развитие', weeks: 10 },
          { name: 'Закрепление', weeks: 4 },
        ],
      },
      goals: { tags: ['комплексный', 'дошкольники', 'ЗПРР'] },
      status: 'published',
      createdById: admin.id,
    },
  });

  // Шаблон 2: Логопедический интенсив
  await prisma.routeTemplate.upsert({
    where: { slug: 'speech-intensive' },
    update: {},
    create: {
      name: 'Логопедический интенсив',
      slug: 'speech-intensive',
      description: 'Интенсивная программа для коррекции речевых нарушений.',
      ageMin: 4,
      ageMax: 8,
      durationWeeks: 16,
      phases: {
        phases: [
          { name: 'Подготовительный', weeks: 2 },
          { name: 'Постановка звуков', weeks: 6 },
          { name: 'Автоматизация', weeks: 6 },
          { name: 'Интеграция в речь', weeks: 2 },
        ],
      },
      goals: { tags: ['логопедия', 'речь', 'интенсив'] },
      status: 'published',
      createdById: admin.id,
    },
  });

  // Шаблон 3: Сенсорная интеграция
  await prisma.routeTemplate.upsert({
    where: { slug: 'sensory-integration' },
    update: {},
    create: {
      name: 'Программа сенсорной интеграции',
      slug: 'sensory-integration',
      description: 'Программа для детей с нарушениями сенсорной обработки.',
      ageMin: 2,
      ageMax: 8,
      durationWeeks: 20,
      phases: {
        phases: [
          { name: 'Оценка и адаптация', weeks: 2 },
          { name: 'Тактильная стимуляция', weeks: 6 },
          { name: 'Вестибулярная система', weeks: 6 },
          { name: 'Проприоцепция', weeks: 4 },
          { name: 'Интеграция', weeks: 2 },
        ],
      },
      goals: { tags: ['сенсорика', 'РАС', 'СДВГ'] },
      status: 'published',
      createdById: admin.id,
    },
  });

  console.log('✅ Проверено/создано шаблонов: 3');

  // ============================================================
  // Примечание: Создание маршрутов и назначений требует
  // дополнительной настройки моделей. Пока пропускаем.
  // ============================================================

  console.log('📝 Пропускаем создание тестовых маршрутов и назначений...');
  console.log('   (требуется синхронизация схемы с DATA_MODEL_AND_EVENTS.md)');

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

