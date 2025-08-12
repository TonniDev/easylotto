-- CreateTable
CREATE TABLE "user_spending" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" DATE NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "description" VARCHAR(255),
    "game_type" VARCHAR(50),
    "games_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_spending_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spending_goals" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "goal_type" VARCHAR(50) NOT NULL,
    "amount_limit" DECIMAL(10,2) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "warning_enabled" BOOLEAN NOT NULL DEFAULT true,
    "warning_threshold" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spending_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spending_insights" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "insight_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "data_snapshot" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spending_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investment_scenarios" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "scenario_name" VARCHAR(100) NOT NULL,
    "monthly_amount" DECIMAL(10,2) NOT NULL,
    "annual_return_rate" DECIMAL(5,4) NOT NULL,
    "time_horizon_years" INTEGER NOT NULL,
    "calculated_result" JSONB NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investment_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spending_reports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "total_spending" DECIMAL(10,2) NOT NULL,
    "lottery_spending" DECIMAL(10,2) NOT NULL,
    "opportunity_cost" DECIMAL(10,2) NOT NULL,
    "report_data" JSONB NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spending_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_spending_id_key" ON "user_spending"("id");

-- CreateIndex
CREATE INDEX "user_spending_user_id_idx" ON "user_spending"("user_id");

-- CreateIndex
CREATE INDEX "user_spending_date_idx" ON "user_spending"("date");

-- CreateIndex
CREATE INDEX "user_spending_category_idx" ON "user_spending"("category");

-- CreateIndex
CREATE INDEX "user_spending_user_id_date_idx" ON "user_spending"("user_id", "date");

-- CreateIndex
CREATE INDEX "user_spending_user_id_category_idx" ON "user_spending"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "spending_goals_id_key" ON "spending_goals"("id");

-- CreateIndex
CREATE INDEX "spending_goals_user_id_idx" ON "spending_goals"("user_id");

-- CreateIndex
CREATE INDEX "spending_goals_user_id_is_active_idx" ON "spending_goals"("user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "spending_insights_id_key" ON "spending_insights"("id");

-- CreateIndex
CREATE INDEX "spending_insights_user_id_idx" ON "spending_insights"("user_id");

-- CreateIndex
CREATE INDEX "spending_insights_user_id_is_read_idx" ON "spending_insights"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "spending_insights_user_id_severity_idx" ON "spending_insights"("user_id", "severity");

-- CreateIndex
CREATE INDEX "spending_insights_expires_at_idx" ON "spending_insights"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "investment_scenarios_id_key" ON "investment_scenarios"("id");

-- CreateIndex
CREATE INDEX "investment_scenarios_user_id_idx" ON "investment_scenarios"("user_id");

-- CreateIndex
CREATE INDEX "investment_scenarios_user_id_is_favorite_idx" ON "investment_scenarios"("user_id", "is_favorite");

-- CreateIndex
CREATE UNIQUE INDEX "spending_reports_id_key" ON "spending_reports"("id");

-- CreateIndex
CREATE INDEX "spending_reports_user_id_idx" ON "spending_reports"("user_id");

-- CreateIndex
CREATE INDEX "spending_reports_user_id_period_start_period_end_idx" ON "spending_reports"("user_id", "period_start", "period_end");

-- CreateIndex
CREATE INDEX "spending_reports_report_type_idx" ON "spending_reports"("report_type");

-- AddForeignKey
ALTER TABLE "user_spending" ADD CONSTRAINT "user_spending_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spending_goals" ADD CONSTRAINT "spending_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spending_insights" ADD CONSTRAINT "spending_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investment_scenarios" ADD CONSTRAINT "investment_scenarios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spending_reports" ADD CONSTRAINT "spending_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
