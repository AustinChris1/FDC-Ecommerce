# E-commerce Platform

## Project Overview

This project is a full-stack e-commerce platform designed to provide a seamless shopping experience for customers and robust management tools for administrators. The frontend is built with React for a dynamic user interface, while the backend is powered by Laravel, offering secure API endpoints for data management, user authentication, and payment processing.

## Key Features

### User-Facing:

* **Product Browsing:** Easily browse products by categories, search, and view detailed product information.

* **Shopping Cart:** Add, update, and remove items from the shopping cart.

* **Secure Checkout:** A multi-step checkout process with integrated payment gateways (e.g., Paystack) and bank transfer options.

* **User Authentication:** Secure user registration, login, and logout.

* **User Profile Management:** Users can view and update their personal details and change passwords.

* **Order Confirmation:** Dedicated page to confirm order details after successful payment.

### Admin-Facing:

* **Dashboard Analytics:** Comprehensive overview of website activity, including total visitors, orders, revenue, users, daily visit trends, top viewing locations, and peak visit hours.

* **Settings Management:** Configure general site settings such as site name, contact information, social media links, site logo, and shipping fees.

* **Activity Feed:** Real-time stream of recent activities like new orders, new user registrations, and low stock alerts.

## Technology Stack

* **Frontend:**

    * React.js

    * Tailwind CSS (for styling)

    * Framer Motion (for animations)

    * Lucide React (for icons)

    * React Toastify (for notifications)

    * Axios (for API requests)

    * React Helmet Async (for SEO)

    * Recharts (for charts in Admin Dashboard)

    * Paystack (for payment processing - integrated directly without `react-paystack` library for better compatibility)

* **Backend:**

    * Laravel (PHP Framework)

    * MySQL (Database)

    * Laravel Passport (for API authentication - assumed)

    * Laravel Mail (for email handling - assumed)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* PHP (>= 8.1)

* Composer

* Node.js (LTS recommended)

* npm or Yarn

* MySQL Database

* Git

### Backend Setup (Laravel)

1.  **Clone the repository:**

    ```
    git clone <https://github.com/AustinChris1/FDC-Ecommerce>
    cd FDC-Ecommerce


    ```

2.  **Install Composer dependencies:**

    ```
    composer install


    ```

3.  **Create a copy of your environment file:**

    ```
    cp .env.example .env


    ```

4.  **Generate an application key:**

    ```
    php artisan key:generate


    ```

5.  **Configure your `.env` file:**
    Open the `.env` file and update your database credentials (`DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) and Mail settings (`MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, etc.).
    Also, add your Paystack Public Key:

    ```
    VITE_PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # Replace with your actual Test Public Key


    ```

6.  **Run database migrations:**

    ```
    php artisan migrate


    ```

    (Optional: If you have seeders for initial data, run `php artisan db:seed`)

7.  **Generate Passport API keys (if using Laravel Passport):**

    ```
    php artisan passport:install


    ```

8.  **Link storage (for uploaded files):**

    ```
    php artisan storage:link


    ```

9.  **Start the Laravel development server:**

    ```
    php artisan serve


    ```

    The backend will typically run on `http://localhost:8000`.

### Frontend Setup (React)

1.  **Navigate to the frontend directory:**
    Assuming your React project is in the root, or if it's in a `frontend` subdirectory:

    ```
    # If React project is in a subdirectory, e.g., 'client'
    # cd client


    ```

2.  **Install npm dependencies:**

    ```
    npm install
    # OR
    yarn install


    ```

3.  **Create a `.env.local` file for frontend environment variables:**
    (This is common for Vite/CRA projects; ensure your frontend framework picks up `VITE_PAYSTACK_PUBLIC_KEY` as needed.)

    ```
    VITE_PAYSTACK_PUBLIC_KEY="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # Must match the one in backend .env


    ```

4.  **Start the React development server:**

    ```
    npm run dev
    # OR
    yarn dev


    ```

    The frontend will typically run on `http://localhost:8000` (or similar).

## Deployment

### Backend Deployment Considerations:

* Ensure your web server (Nginx/Apache) is configured to serve Laravel applications.

* Update your `.env` file with production database credentials, email settings, and Paystack production keys.

* Run `composer install --optimize-autoloader --no-dev`.

* Run `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache`.

### Frontend Deployment Considerations:

* Build the React application for production: `pnpm build` (or `yarn build`).

* Configure your web server to serve the static files from the `build` or `dist` directory.

* Ensure the API endpoint in your React code (`API_URL`) points to your production backend.

## Contributing

Contributions are welcome! Please follow standard Git Flow:

1.  Fork the repository.

2.  Create a new feature branch (`git checkout -b feature/AmazingFeature`).

3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).

4.  Push to the branch (`git push origin feature/AmazingFeature`).

5.  Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` for more information.

---
**Note to Developers:**

* Remember to replace placeholder URLs and keys with your actual values.

* Always check Laravel logs (`storage/logs/laravel.log`) for backend errors.

* For frontend environment variables, ensure your build tool (Vite, Create React App) is correctly configured to read them.