FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    libzip-dev \
    zip \
    libssl-dev \
    pkg-config

RUN docker-php-ext-install zip

# Install MongoDB extension
RUN pecl install mongodb && docker-php-ext-enable mongodb

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install

EXPOSE 10000

CMD php artisan serve --host=0.0.0.0 --port=$PORT