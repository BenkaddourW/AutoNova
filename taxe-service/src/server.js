const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const taxeRoutes = require('./routes/taxeRoutes');
const errorHandler = require('./middlewares/errorHandler');
const authenticateToken = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3009;

// router.use(authenticateToken);
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/taxes', taxeRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Taxe Service running on http://localhost:${PORT}`);
});
