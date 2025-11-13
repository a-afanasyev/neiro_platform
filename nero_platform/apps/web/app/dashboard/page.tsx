/**
 * Dashboard page (заглушка)
 * 
 * В будущем будет роль-специфичный дашборд
 */

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Активные дети</h3>
          <p className="text-3xl font-bold text-primary">0</p>
          <p className="text-sm text-muted-foreground mt-2">
            Дети под вашим сопровождением
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Задания на сегодня</h3>
          <p className="text-3xl font-bold text-warning">0</p>
          <p className="text-sm text-muted-foreground mt-2">
            Новые отчеты и назначения
          </p>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-2">Консультации</h3>
          <p className="text-3xl font-bold text-info">0</p>
          <p className="text-sm text-muted-foreground mt-2">
            Запланировано на неделю
          </p>
        </div>
      </div>

      <div className="mt-8 p-6 border rounded-lg bg-muted">
        <p className="text-center text-muted-foreground">
          🚧 Dashboard в разработке. Функционал будет добавлен в Месяц 1-3.
        </p>
      </div>
    </div>
  );
}

