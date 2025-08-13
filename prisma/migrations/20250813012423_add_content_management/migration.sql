-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featured_image" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "category_id" UUID,
    "author_id" UUID NOT NULL,
    "reading_time" INTEGER,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "seo_title" VARCHAR(255),
    "seo_description" VARCHAR(500),
    "seo_keywords" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_categories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "icon" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_tags" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "article_id" UUID NOT NULL,
    "tag_name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_views" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "article_id" UUID NOT NULL,
    "user_id" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT NOT NULL,
    "block_type" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educational_resources" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "resource_type" VARCHAR(50) NOT NULL,
    "resource_url" VARCHAR(500),
    "thumbnail_url" VARCHAR(500),
    "difficulty_level" VARCHAR(20) NOT NULL,
    "estimated_time" INTEGER,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educational_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "articles_id_key" ON "articles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE INDEX "articles_category_id_idx" ON "articles"("category_id");

-- CreateIndex
CREATE INDEX "articles_author_id_idx" ON "articles"("author_id");

-- CreateIndex
CREATE INDEX "articles_published_at_idx" ON "articles"("published_at");

-- CreateIndex
CREATE INDEX "articles_slug_idx" ON "articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "article_categories_id_key" ON "article_categories"("id");

-- CreateIndex
CREATE UNIQUE INDEX "article_categories_name_key" ON "article_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "article_categories_slug_key" ON "article_categories"("slug");

-- CreateIndex
CREATE INDEX "article_categories_is_active_idx" ON "article_categories"("is_active");

-- CreateIndex
CREATE INDEX "article_categories_sort_order_idx" ON "article_categories"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "article_tags_id_key" ON "article_tags"("id");

-- CreateIndex
CREATE INDEX "article_tags_tag_name_idx" ON "article_tags"("tag_name");

-- CreateIndex
CREATE UNIQUE INDEX "article_tags_article_id_tag_name_key" ON "article_tags"("article_id", "tag_name");

-- CreateIndex
CREATE UNIQUE INDEX "article_views_id_key" ON "article_views"("id");

-- CreateIndex
CREATE INDEX "article_views_article_id_idx" ON "article_views"("article_id");

-- CreateIndex
CREATE INDEX "article_views_user_id_idx" ON "article_views"("user_id");

-- CreateIndex
CREATE INDEX "article_views_viewed_at_idx" ON "article_views"("viewed_at");

-- CreateIndex
CREATE UNIQUE INDEX "content_blocks_id_key" ON "content_blocks"("id");

-- CreateIndex
CREATE UNIQUE INDEX "content_blocks_name_key" ON "content_blocks"("name");

-- CreateIndex
CREATE INDEX "content_blocks_block_type_idx" ON "content_blocks"("block_type");

-- CreateIndex
CREATE INDEX "content_blocks_is_active_idx" ON "content_blocks"("is_active");

-- CreateIndex
CREATE INDEX "content_blocks_sort_order_idx" ON "content_blocks"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "educational_resources_id_key" ON "educational_resources"("id");

-- CreateIndex
CREATE INDEX "educational_resources_resource_type_idx" ON "educational_resources"("resource_type");

-- CreateIndex
CREATE INDEX "educational_resources_difficulty_level_idx" ON "educational_resources"("difficulty_level");

-- CreateIndex
CREATE INDEX "educational_resources_is_featured_idx" ON "educational_resources"("is_featured");

-- CreateIndex
CREATE INDEX "educational_resources_is_active_idx" ON "educational_resources"("is_active");

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "article_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_tags" ADD CONSTRAINT "article_tags_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_views" ADD CONSTRAINT "article_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
