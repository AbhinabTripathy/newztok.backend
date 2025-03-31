const express = require("express");
require("dotenv").config();
const sequelize = require("./config/db");
const sendResponse = require("./middlewares/response.middleware");
const handleNotFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/errorHandler.middleware");
const authRoutes = require("./routes/auth.routes");
const newsRoutes=require("./routes/news.routes");
require('./models/index');
const seedSuperAdmin=require('./seeders/superAdminSeeder');
const interactionRoutes=require('./routes/interaction.routes');
const userController = require("./controllers/user.controller");
const userRoutes=require('./routes/user.routes');
const cors=require('cors');
const path = require('path');

const app = express();
const port = process.env.APP_PORT;
const baseUrl = process.env.BASE_URL;

app.use(cors());
// Increase JSON and URL-encoded payload limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(sendResponse);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/news',newsRoutes);
app.use('/api/interaction',interactionRoutes);
app.use('/api/users',userRoutes);
app.use(handleNotFound);
app.use(errorHandler);

async function startServer() {
    try {
        // First connect to database
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Then sync models
        await sequelize.sync({ force: false });
        console.log('Database tables synced successfully.');

        //seed super admin
        await seedSuperAdmin();

        // Finally start the server
        app.listen(port, () => {
            console.log(`Server running at : ${baseUrl}`);
        });
    } catch (error) {
        console.error("Server startup error:", error);
        process.exit(1); // Exit if startup fails
    }
}

startServer();
