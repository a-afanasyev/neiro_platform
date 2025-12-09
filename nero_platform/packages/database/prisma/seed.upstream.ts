/**
 * Comprehensive Seed Data Script for Neiro Platform
 * Covers all functionality for Months 1-3 and CJM scenarios
 *
 * Run with: pnpm --filter @neiro/database seed
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seed data generation...')

  // Clean existing data (in development only!)
  console.log('🗑️  Cleaning existing data...')
  await prisma.userNotification.deleteMany()
  await prisma.notificationPreference.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.reportReview.deleteMany()
  await prisma.report.deleteMany()
  await prisma.assignmentHistory.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.phaseExercise.deleteMany()
  await prisma.goalExercise.deleteMany()
  await prisma.routePhaseMilestone.deleteMany()
  await prisma.routeGoal.deleteMany()
  await prisma.routePhase.deleteMany()
  await prisma.routeRevisionHistory.deleteMany()
  await prisma.route.deleteMany()
  await prisma.templateExercise.deleteMany()
  await prisma.templateMilestone.deleteMany()
  await prisma.templateGoal.deleteMany()
  await prisma.templatePhase.deleteMany()
  await prisma.routeTemplate.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.diagnosticSessionResult.deleteMany()
  await prisma.routeRecommendation.deleteMany()
  await prisma.diagnosticSession.deleteMany()
  await prisma.childSpecialist.deleteMany()
  await prisma.childParent.deleteMany()
  await prisma.child.deleteMany()
  await prisma.specialist.deleteMany()
  await prisma.user.deleteMany()

  // ============================================================
  // 1. USERS
  // ============================================================
  console.log('👤 Creating users...')

  // Passwords matching test expectations
  const admin123 = await bcrypt.hash('admin123', 10)
  const parent123 = await bcrypt.hash('parent123', 10)

  // Admin user - matches test: admin@neiro.dev / admin123
  const adminUser = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@neiro.dev',
      password: admin123,
      phone: '+7 (999) 100-00-01',
      role: 'admin',
      status: 'active',
    },
  })

  // Parent user - matches test: parent1@example.com / parent123
  const parentUser = await prisma.user.create({
    data: {
      firstName: 'Parent',
      lastName: 'One',
      email: 'parent1@example.com',
      password: parent123,
      phone: '+7 (999) 100-00-02',
      role: 'parent',
      status: 'active',
    },
  })

  // Specialist 1 - matches test: specialist1@example.com / admin123
  const specialistUser = await prisma.user.create({
    data: {
      firstName: 'Specialist',
      lastName: 'One',
      email: 'specialist1@example.com',
      password: admin123,
      phone: '+7 (999) 100-00-03',
      role: 'specialist',
      status: 'active',
    },
  })

  // Specialist 2 - matches test: specialist2@example.com / admin123
  const specialist2User = await prisma.user.create({
    data: {
      firstName: 'Specialist',
      lastName: 'Two',
      email: 'specialist2@example.com',
      password: admin123,
      phone: '+7 (999) 100-00-04',
      role: 'specialist',
      status: 'active',
    },
  })

  // Supervisor - matches test: supervisor@neiro.dev / admin123
  const supervisorUser = await prisma.user.create({
    data: {
      firstName: 'Supervisor',
      lastName: 'User',
      email: 'supervisor@neiro.dev',
      password: admin123,
      phone: '+7 (999) 100-00-05',
      role: 'supervisor',
      status: 'active',
    },
  })

  console.log(`✅ Created ${5} users`)

  // ============================================================
  // 2. SPECIALISTS
  // ============================================================
  console.log('🩺 Creating specialist profiles...')

  const specialist = await prisma.specialist.create({
    data: {
      userId: specialistUser.id,
      specialty: 'neuropsychologist',
      licenseNumber: 'NPL-12345',
      licenseValidUntil: new Date('2026-12-31'),
      experienceYears: 8,
      bio: 'Нейропсихолог с 8-летним опытом работы с детьми с РАС',
    },
  })

  const specialist2 = await prisma.specialist.create({
    data: {
      userId: specialist2User.id,
      specialty: 'speech_therapist',
      licenseNumber: 'SPT-54321',
      licenseValidUntil: new Date('2026-12-31'),
      experienceYears: 5,
      bio: 'Логопед-дефектолог, специализация на работе с детьми с РАС',
    },
  })

  const supervisor = await prisma.specialist.create({
    data: {
      userId: supervisorUser.id,
      specialty: 'supervisor',
      licenseNumber: 'SUP-67890',
      licenseValidUntil: new Date('2026-12-31'),
      experienceYears: 12,
      bio: 'Супервизор ABA-терапии, сертификат BCBA',
    },
  })

  console.log(`✅ Created ${3} specialist profiles`)

  // ============================================================
  // 3. CHILDREN
  // ============================================================
  console.log('👶 Creating children...')

  const child1 = await prisma.child.create({
    data: {
      firstName: 'Алиса',
      lastName: 'Иванова',
      birthDate: new Date('2018-05-15'),
      gender: 'female',
      diagnosisSummary: 'РАС, легкая степень. Задержка речевого развития.',
      notes: 'Любит собирать конструкторы, хорошо реагирует на визуальные подсказки',
    },
  })

  const child2 = await prisma.child.create({
    data: {
      firstName: 'Борис',
      lastName: 'Петров',
      birthDate: new Date('2019-08-22'),
      gender: 'male',
      diagnosisSummary: 'РАС, средняя степень. Сенсорные особенности.',
      notes: 'Чувствителен к громким звукам, предпочитает тихие игры',
    },
  })

  const child3 = await prisma.child.create({
    data: {
      firstName: 'Максим',
      lastName: 'Сидоров',
      birthDate: new Date('2017-11-03'),
      gender: 'male',
      diagnosisSummary: 'РАС, легкая степень. Высокофункциональный аутизм.',
      notes: 'Проявляет интерес к математике и музыке',
    },
  })

  console.log(`✅ Created ${3} children`)

  // ============================================================
  // 4. CHILD-PARENT LINKS
  // ============================================================
  console.log('👨‍👩‍👧‍👦 Linking children to parents...')

  await prisma.childParent.createMany({
    data: [
      {
        childId: child1.id,
        parentUserId: parentUser.id,
        relationship: 'mother',
        legalGuardian: true,
        linkedAt: new Date('2024-01-15'),
      },
      {
        childId: child2.id,
        parentUserId: parentUser.id,
        relationship: 'mother',
        legalGuardian: true,
        linkedAt: new Date('2024-02-10'),
      },
      {
        childId: child3.id,
        parentUserId: parentUser.id,
        relationship: 'mother',
        legalGuardian: true,
        linkedAt: new Date('2024-01-20'),
      },
    ],
  })

  console.log(`✅ Linked children to parent`)

  // ============================================================
  // 5. CHILD-SPECIALIST LINKS
  // ============================================================
  console.log('🔗 Linking children to specialists...')

  await prisma.childSpecialist.createMany({
    data: [
      {
        childId: child1.id,
        specialistId: specialist.id,
        specialization: 'lead',
        isPrimary: true,
        assignedAt: new Date('2024-01-15'),
      },
      {
        childId: child2.id,
        specialistId: specialist.id,
        specialization: 'lead',
        isPrimary: true,
        assignedAt: new Date('2024-02-10'),
      },
      {
        childId: child3.id,
        specialistId: supervisor.id,
        specialization: 'supervisor',
        isPrimary: true,
        assignedAt: new Date('2024-01-20'),
      },
    ],
  })

  console.log(`✅ Linked children to specialists`)

  // ============================================================
  // 6. EXERCISES
  // ============================================================
  console.log('🎯 Creating exercises...')

  const exercises = await Promise.all([
    prisma.exercise.create({
      data: {
        title: 'Сортировка по цветам',
        slug: 'color-sorting-basic',
        description: 'Упражнение на развитие визуального восприятия и навыков классификации',
        category: 'cognitive',
        ageMin: 3,
        ageMax: 7,
        difficulty: 'beginner',
        durationMinutes: 15,
        materials: { items: ['Цветные карточки', 'Корзинки', 'Игрушки'] },
        instructions: { steps: ['Показать образец', 'Дать задание', 'Поощрить успех'] },
        successCriteria: { criteria: ['3 из 5 правильно'] },
      },
    }),
    prisma.exercise.create({
      data: {
        title: 'Подражание действиям',
        slug: 'imitation-actions',
        description: 'Развитие навыков имитации простых действий',
        category: 'social',
        ageMin: 2,
        ageMax: 6,
        difficulty: 'beginner',
        durationMinutes: 10,
        materials: { items: ['Игрушки', 'Бытовые предметы'] },
        instructions: { steps: ['Показать действие', 'Попросить повторить', 'Усложнить'] },
        successCriteria: { criteria: ['4 из 5 действий'] },
      },
    }),
    prisma.exercise.create({
      data: {
        title: 'Называние предметов',
        slug: 'naming-objects',
        description: 'Расширение словарного запаса через называние предметов',
        category: 'speech',
        ageMin: 3,
        ageMax: 8,
        difficulty: 'intermediate',
        durationMinutes: 20,
        materials: { items: ['Карточки с картинками', 'Реальные предметы'] },
        instructions: { steps: ['Показать предмет', 'Назвать его', 'Попросить повторить'] },
        successCriteria: { criteria: ['10 новых слов за месяц'] },
      },
    }),
    prisma.exercise.create({
      data: {
        title: 'Игра в прятки (поиск предметов)',
        slug: 'hide-and-seek-objects',
        description: 'Развитие внимания и навыков поиска',
        category: 'cognitive',
        ageMin: 3,
        ageMax: 7,
        difficulty: 'beginner',
        durationMinutes: 15,
        materials: { items: ['Игрушки', 'Ткань для укрывания'] },
        instructions: { steps: ['Спрятать предмет', 'Попросить найти', 'Поощрить'] },
        successCriteria: { criteria: ['Находит за 30 секунд'] },
      },
    }),
    prisma.exercise.create({
      data: {
        title: 'Совместная игра с кубиками',
        slug: 'shared-block-play',
        description: 'Развитие навыков совместной игры и коммуникации',
        category: 'social',
        ageMin: 3,
        ageMax: 8,
        difficulty: 'intermediate',
        durationMinutes: 20,
        materials: { items: ['Кубики', 'Конструктор'] },
        instructions: { steps: ['Начать строить', 'Пригласить присоединиться', 'Хвалить'] },
        successCriteria: { criteria: ['5 минут совместной игры'] },
      },
    }),
  ])

  console.log(`✅ Created ${exercises.length} exercises`)

  // ============================================================
  // 7. ROUTES
  // ============================================================
  console.log('🗺️  Creating routes...')

  const route1 = await prisma.route.create({
    data: {
      childId: child1.id,
      leadSpecialistId: specialist.id,
      title: 'Развитие коммуникации и социальных навыков',
      summary: 'Маршрут направлен на развитие базовых коммуникативных навыков и улучшение социального взаимодействия',
      status: 'active',
      planHorizonWeeks: 24,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-01'),
    },
  })

  const route2 = await prisma.route.create({
    data: {
      childId: child2.id,
      leadSpecialistId: specialist.id,
      title: 'Сенсорная интеграция и когнитивное развитие',
      summary: 'Коррекция сенсорных особенностей и развитие когнитивных функций',
      status: 'active',
      planHorizonWeeks: 20,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-07-15'),
    },
  })

  const route3 = await prisma.route.create({
    data: {
      childId: child3.id,
      leadSpecialistId: supervisor.id,
      title: 'Академические навыки и эмоциональная регуляция',
      summary: 'Подготовка к школе и развитие навыков эмоциональной регуляции',
      status: 'active',
      planHorizonWeeks: 16,
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-06-15'),
    },
  })

  console.log(`✅ Created ${3} routes`)

  // ============================================================
  // 8. ROUTE GOALS
  // ============================================================
  console.log('🎯 Creating route goals...')

  const goal1_1 = await prisma.routeGoal.create({
    data: {
      routeId: route1.id,
      category: 'Коммуникация',
      goalType: 'skill',
      description: 'Использует жесты для выражения потребностей',
      targetMetric: 'Количество жестов',
      measurementUnit: 'жестов/день',
      baselineValue: 2,
      targetValue: 10,
      reviewPeriodWeeks: 4,
      priority: 'high',
      status: 'active',
    },
  })

  const goal1_2 = await prisma.routeGoal.create({
    data: {
      routeId: route1.id,
      category: 'Социальные навыки',
      goalType: 'behaviour',
      description: 'Инициирует контакт глазами',
      targetMetric: 'Частота контакта глаз',
      measurementUnit: 'раз/занятие',
      baselineValue: 1,
      targetValue: 5,
      reviewPeriodWeeks: 4,
      priority: 'high',
      status: 'active',
    },
  })

  const goal2_1 = await prisma.routeGoal.create({
    data: {
      routeId: route2.id,
      category: 'Когнитивные навыки',
      goalType: 'skill',
      description: 'Сортирует предметы по 2 признакам',
      targetMetric: 'Точность выполнения',
      measurementUnit: '%',
      baselineValue: 30,
      targetValue: 80,
      reviewPeriodWeeks: 6,
      priority: 'medium',
      status: 'active',
    },
  })

  console.log(`✅ Created route goals`)

  // ============================================================
  // 9. ROUTE PHASES
  // ============================================================
  console.log('📋 Creating route phases...')

  const phase1_1 = await prisma.routePhase.create({
    data: {
      routeId: route1.id,
      responsibleSpecialistId: specialist.id,
      name: 'Фаза 1: Базовые коммуникативные навыки',
      description: 'Установление базовых коммуникативных паттернов',
      orderIndex: 1,
      status: 'active',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-01'),
      durationWeeks: 8,
      expectedOutcomes: 'Ребенок использует базовые жесты, отзывается на имя',
    },
  })

  const phase1_2 = await prisma.routePhase.create({
    data: {
      routeId: route1.id,
      responsibleSpecialistId: specialist.id,
      name: 'Фаза 2: Расширение коммуникации',
      description: 'Увеличение словарного запаса и усложнение коммуникации',
      orderIndex: 2,
      status: 'planned',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-01'),
      durationWeeks: 8,
      expectedOutcomes: 'Использует 20+ слов, комбинирует слова',
    },
  })

  const phase2_1 = await prisma.routePhase.create({
    data: {
      routeId: route2.id,
      responsibleSpecialistId: specialist.id,
      name: 'Фаза 1: Сенсорная адаптация',
      description: 'Работа с сенсорными особенностями',
      orderIndex: 1,
      status: 'active',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-05-01'),
      durationWeeks: 8,
      expectedOutcomes: 'Снижение чувствительности к звукам',
    },
  })

  const phase3_1 = await prisma.routePhase.create({
    data: {
      routeId: route3.id,
      responsibleSpecialistId: supervisor.id,
      name: 'Фаза 1: Подготовка к школе',
      description: 'Развитие академических предпосылок',
      orderIndex: 1,
      status: 'active',
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-04-15'),
      durationWeeks: 8,
      expectedOutcomes: 'Умеет сидеть на занятии, следует инструкциям',
    },
  })

  console.log(`✅ Created route phases`)

  // ============================================================
  // 10. PHASE EXERCISES
  // ============================================================
  console.log('🔗 Linking exercises to phases...')

  await prisma.phaseExercise.createMany({
    data: [
      {
        phaseId: phase1_1.id,
        exerciseId: exercises[1].id, // Подражание действиям
        orderIndex: 1,
        frequencyPerWeek: 5,
        durationMinutes: 10,
        isMandatory: true,
      },
      {
        phaseId: phase1_1.id,
        exerciseId: exercises[2].id, // Называние предметов
        orderIndex: 2,
        frequencyPerWeek: 3,
        durationMinutes: 20,
        isMandatory: true,
      },
      {
        phaseId: phase2_1.id,
        exerciseId: exercises[0].id, // Сортировка по цветам
        orderIndex: 1,
        frequencyPerWeek: 4,
        durationMinutes: 15,
        isMandatory: true,
      },
      {
        phaseId: phase2_1.id,
        exerciseId: exercises[3].id, // Игра в прятки
        orderIndex: 2,
        frequencyPerWeek: 3,
        durationMinutes: 15,
        isMandatory: false,
      },
      {
        phaseId: phase3_1.id,
        exerciseId: exercises[4].id, // Совместная игра
        orderIndex: 1,
        frequencyPerWeek: 5,
        durationMinutes: 20,
        isMandatory: true,
      },
    ],
  })

  console.log(`✅ Linked exercises to phases`)

  // ============================================================
  // 11. ASSIGNMENTS
  // ============================================================
  console.log('📅 Creating assignments...')

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

  const assignments = await Promise.all([
    // Completed assignments with reports
    prisma.assignment.create({
      data: {
        childId: child1.id,
        exerciseId: exercises[1].id,
        assignedById: specialistUser.id,
        specialistId: specialist.userId,
        routeId: route1.id,
        phaseId: phase1_1.id,
        plannedStartDate: yesterday,
        dueDate: tomorrow,
        status: 'in_progress',
        deliveryChannel: 'home',
        frequencyPerWeek: 5,
        expectedDurationMinutes: 10,
        notes: 'Уделите внимание четкости действий',
      },
    }),
    prisma.assignment.create({
      data: {
        childId: child1.id,
        exerciseId: exercises[2].id,
        assignedById: specialistUser.id,
        specialistId: specialist.userId,
        routeId: route1.id,
        phaseId: phase1_1.id,
        plannedStartDate: twoDaysAgo,
        dueDate: twoDaysAgo,
        status: 'completed',
        deliveryChannel: 'home',
        frequencyPerWeek: 3,
        expectedDurationMinutes: 20,
        notes: 'Начните с 5 простых слов',
      },
    }),
    prisma.assignment.create({
      data: {
        childId: child2.id,
        exerciseId: exercises[0].id,
        assignedById: specialistUser.id,
        specialistId: specialist.userId,
        routeId: route2.id,
        phaseId: phase2_1.id,
        plannedStartDate: weekAgo,
        dueDate: yesterday,
        status: 'completed',
        deliveryChannel: 'home',
        frequencyPerWeek: 4,
        expectedDurationMinutes: 15,
        notes: 'Используйте яркие цвета',
      },
    }),
    // In progress assignments
    prisma.assignment.create({
      data: {
        childId: child1.id,
        exerciseId: exercises[4].id,
        assignedById: specialistUser.id,
        specialistId: specialist.userId,
        routeId: route1.id,
        phaseId: phase1_1.id,
        plannedStartDate: yesterday,
        dueDate: tomorrow,
        status: 'in_progress',
        deliveryChannel: 'home',
        frequencyPerWeek: 5,
        expectedDurationMinutes: 20,
      },
    }),
    prisma.assignment.create({
      data: {
        childId: child2.id,
        exerciseId: exercises[3].id,
        assignedById: specialistUser.id,
        specialistId: specialist.userId,
        routeId: route2.id,
        phaseId: phase2_1.id,
        plannedStartDate: yesterday,
        dueDate: twoDaysLater,
        status: 'in_progress',
        deliveryChannel: 'home',
        frequencyPerWeek: 3,
        expectedDurationMinutes: 15,
      },
    }),
    // Future assigned assignments
    prisma.assignment.create({
      data: {
        childId: child3.id,
        exerciseId: exercises[4].id,
        assignedById: supervisorUser.id,
        specialistId: supervisor.userId,
        routeId: route3.id,
        phaseId: phase3_1.id,
        plannedStartDate: tomorrow,
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'assigned',
        deliveryChannel: 'home',
        frequencyPerWeek: 5,
        expectedDurationMinutes: 20,
      },
    }),
    prisma.assignment.create({
      data: {
        childId: child1.id,
        exerciseId: exercises[0].id,
        assignedById: specialistUser.id,
        specialistId: specialist.userId,
        routeId: route1.id,
        phaseId: phase1_1.id,
        plannedStartDate: twoDaysLater,
        dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        status: 'assigned',
        deliveryChannel: 'home',
        frequencyPerWeek: 4,
        expectedDurationMinutes: 15,
      },
    }),
    // Overdue assignment
    prisma.assignment.create({
      data: {
        childId: child2.id,
        exerciseId: exercises[2].id,
        assignedById: specialistUser.id,
        specialistId: specialist.userId,
        routeId: route2.id,
        phaseId: phase2_1.id,
        plannedStartDate: weekAgo,
        dueDate: twoDaysAgo,
        status: 'overdue',
        deliveryChannel: 'home',
        frequencyPerWeek: 3,
        expectedDurationMinutes: 20,
      },
    }),
  ])

  console.log(`✅ Created ${assignments.length} assignments`)

  // ============================================================
  // 12. REPORTS
  // ============================================================
  console.log('📝 Creating reports...')

  const reports = await Promise.all([
    // Approved report
    prisma.report.create({
      data: {
        assignmentId: assignments[0].id,
        parentId: parentUser.id,
        submittedAt: new Date(threeDaysAgo.getTime() + 2 * 60 * 60 * 1000),
        status: 'completed',
        durationMinutes: 12,
        childMood: 'good',
        feedbackText: 'Алексей отлично справился! Повторял все действия с первого раза. Особенно понравилось хлопать в ладоши.',
        reviewStatus: 'approved',
        reviewedAt: new Date(twoDaysAgo.getTime() + 10 * 60 * 60 * 1000),
      },
    }),
    // Needs attention report
    prisma.report.create({
      data: {
        assignmentId: assignments[1].id,
        parentId: parentUser.id,
        submittedAt: new Date(twoDaysAgo.getTime() + 3 * 60 * 60 * 1000),
        status: 'partial',
        durationMinutes: 15,
        childMood: 'neutral',
        feedbackText: 'Назвал 3 из 5 слов. Путает "мяч" и "шар". Нужно больше времени на повторение.',
        reviewStatus: 'needs_attention',
        reviewedAt: new Date(yesterday.getTime() + 9 * 60 * 60 * 1000),
      },
    }),
    // Not reviewed report
    prisma.report.create({
      data: {
        assignmentId: assignments[2].id,
        parentId: parentUser.id,
        submittedAt: new Date(yesterday.getTime() + 5 * 60 * 60 * 1000),
        status: 'completed',
        durationMinutes: 18,
        childMood: 'good',
        feedbackText: 'София хорошо сортировала цвета. Все 5 попыток были успешными. Проявляла интерес к заданию.',
        reviewStatus: 'not_reviewed',
      },
    }),
    // Another completed report for variety
    prisma.report.create({
      data: {
        assignmentId: assignments[0].id,
        parentId: parentUser.id,
        submittedAt: new Date(threeDaysAgo.getTime() + 12 * 60 * 60 * 1000),
        status: 'completed',
        durationMinutes: 10,
        childMood: 'good',
        feedbackText: 'Второе занятие за день. Алексей уже более уверенно выполнял действия.',
        reviewStatus: 'approved',
        reviewedAt: new Date(twoDaysAgo.getTime() + 14 * 60 * 60 * 1000),
      },
    }),
    // Difficult mood report
    prisma.report.create({
      data: {
        assignmentId: assignments[1].id,
        parentId: parentUser.id,
        submittedAt: new Date(weekAgo.getTime() + 8 * 60 * 60 * 1000),
        status: 'failed',
        durationMinutes: 5,
        childMood: 'difficult',
        feedbackText: 'Алексей был не в настроении, отказывался заниматься. Прекратили занятие раньше времени.',
        reviewStatus: 'approved',
        reviewedAt: new Date(weekAgo.getTime() + 20 * 60 * 60 * 1000),
      },
    }),
  ])

  console.log(`✅ Created ${reports.length} reports`)

  // ============================================================
  // 13. USER NOTIFICATIONS
  // ============================================================
  console.log('🔔 Creating notifications...')

  const notificationTypes = [
    {
      type: 'assignment_reminder',
      title: 'Напоминание о задании',
      body: 'Не забудьте выполнить задание "Подражание действиям" сегодня',
      userId: parentUser.id,
      status: 'unread',
    },
    {
      type: 'report_reviewed',
      title: 'Отчет проверен',
      body: 'Специалист проверил ваш отчет по заданию "Называние предметов". Статус: требует внимания',
      userId: parentUser.id,
      status: 'read',
      readAt: new Date(yesterday.getTime() + 12 * 60 * 60 * 1000),
    },
    {
      type: 'assignment_reminder',
      title: 'Новое задание',
      body: 'Назначено новое задание: "Совместная игра с кубиками"',
      userId: parentUser.id,
      status: 'unread',
    },
    {
      type: 'report_submitted',
      title: 'Получен новый отчет',
      body: 'Родитель отправил отчет по заданию "Сортировка по цветам"',
      userId: specialistUser.id,
      status: 'unread',
    },
    {
      type: 'route_updated',
      title: 'Маршрут обновлен',
      body: 'Специалист обновил коррекционный маршрут для Алисы Ивановой',
      userId: parentUser.id,
      status: 'read',
      readAt: new Date(twoDaysAgo.getTime() + 10 * 60 * 60 * 1000),
    },
    {
      type: 'goal_achieved',
      title: 'Цель достигнута!',
      body: 'Алиса достигла цели "Использует жесты для выражения потребностей"!',
      userId: parentUser.id,
      status: 'read',
      readAt: new Date(yesterday.getTime() + 16 * 60 * 60 * 1000),
    },
    {
      type: 'assignment_overdue',
      title: 'Задание просрочено',
      body: 'Задание "Называние предметов" не было выполнено в срок',
      userId: parentUser.id,
      status: 'unread',
    },
    {
      type: 'system_message',
      title: 'Обновление платформы',
      body: 'Сегодня в 02:00 будет проведено обновление системы',
      userId: parentUser.id,
      status: 'read',
      readAt: new Date(weekAgo.getTime() + 8 * 60 * 60 * 1000),
    },
    {
      type: 'report_reviewed',
      title: 'Отчет одобрен',
      body: 'Ваш отчет по заданию "Подражание действиям" одобрен специалистом',
      userId: parentUser.id,
      status: 'read',
      readAt: new Date(twoDaysAgo.getTime() + 11 * 60 * 60 * 1000),
    },
    {
      type: 'assignment_reminder',
      title: 'Новое задание для Бориса',
      body: 'Назначено новое задание: "Игра в прятки"',
      userId: parentUser.id,
      status: 'read',
      readAt: new Date(yesterday.getTime() + 14 * 60 * 60 * 1000),
    },
  ]

  for (const notif of notificationTypes) {
    await prisma.userNotification.create({
      data: {
        userId: notif.userId,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        status: notif.status,
        readAt: notif.readAt,
        createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log(`✅ Created ${notificationTypes.length} notifications`)

  // ============================================================
  // 14. NOTIFICATION PREFERENCES
  // ============================================================
  console.log('⚙️  Creating notification preferences...')

  await Promise.all([
    prisma.notificationPreference.upsert({
      where: { userId: parentUser.id },
      update: {},
      create: {
        userId: parentUser.id,
        preferences: {
          emailEnabled: true,
          inAppEnabled: true,
          assignmentReminders: true,
          reportUpdates: true,
          routeChanges: true,
        },
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00',
          timezone: 'Europe/Moscow',
        },
      },
    }),
    prisma.notificationPreference.upsert({
      where: { userId: specialistUser.id },
      update: {},
      create: {
        userId: specialistUser.id,
        preferences: {
          emailEnabled: true,
          inAppEnabled: true,
          assignmentReminders: false,
          reportUpdates: true,
          routeChanges: true,
        },
      },
    }),
    prisma.notificationPreference.upsert({
      where: { userId: supervisorUser.id },
      update: {},
      create: {
        userId: supervisorUser.id,
        preferences: {
          emailEnabled: true,
          inAppEnabled: true,
          assignmentReminders: false,
          reportUpdates: true,
          routeChanges: true,
        },
      },
    }),
    prisma.notificationPreference.upsert({
      where: { userId: adminUser.id },
      update: {},
      create: {
        userId: adminUser.id,
        preferences: {
          emailEnabled: true,
          inAppEnabled: true,
          assignmentReminders: false,
          reportUpdates: false,
          routeChanges: false,
        },
      },
    }),
  ])

  console.log(`✅ Created notification preferences`)

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n✨ Seed data generation completed successfully!\n')
  console.log('📊 Summary:')
  console.log(`   👤 Users: 5 (admin, 2 specialists, supervisor, parent)`)
  console.log(`   👶 Children: 3`)
  console.log(`   🗺️  Routes: 3 (active)`)
  console.log(`   📋 Phases: 4`)
  console.log(`   🎯 Goals: 3`)
  console.log(`   💪 Exercises: ${exercises.length}`)
  console.log(`   📅 Assignments: ${assignments.length}`)
  console.log(`   📝 Reports: ${reports.length}`)
  console.log(`   🔔 Notifications: ${notificationTypes.length}`)
  console.log('\n🔐 Test accounts (matching e2e test expectations):')
  console.log('   admin@neiro.dev / admin123')
  console.log('   parent1@example.com / parent123')
  console.log('   specialist1@example.com / admin123')
  console.log('   specialist2@example.com / admin123')
  console.log('   supervisor@neiro.dev / admin123')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
