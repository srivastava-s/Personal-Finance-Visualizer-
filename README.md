# Personal Finance Visualizer

A modern, full-stack web application for tracking and visualizing personal finances. Built with Next.js, React, shadcn/ui, Recharts, and MongoDB.

## ✨ Features

- 💰 **Transaction Management**: Add, edit, and delete income and expenses
- 📊 **Data Visualization**: Interactive charts and graphs with Recharts
- 🏷️ **Categories**: Organize transactions by custom categories
- 📅 **Time Tracking**: Monthly and yearly financial summaries
- 💡 **Budget Planning**: Set and track budget goals
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful interface with shadcn/ui components
- ⚡ **Fast Performance**: Built with Next.js for optimal performance

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18, TypeScript
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Database**: MongoDB with Mongoose ODM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Notifications**: Custom toast system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-finance-visualizer
   ```

2. **Run setup script**
   ```bash
   node setup.js
   ```

3. **Configure environment**
   ```bash
   # Copy environment template
   cp env.example .env.local
   
   # Update MongoDB connection string
   # For local MongoDB: mongodb://localhost:27017/personal-finance-visualizer
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/personal-finance-visualizer
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to http://localhost:3000
   - Start managing your finances!

## 📁 Project Structure

```
personal-finance-visualizer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Dashboard page
│   │   ├── globals.css        # Global styles
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── Dashboard.tsx     # Dashboard component
│   │   └── charts/           # Chart components
│   ├── lib/                  # Utility functions
│   │   ├── utils.ts          # General utilities
│   │   └── db.ts             # Database connection
│   ├── models/               # Mongoose models
│   │   ├── Category.ts       # Category model
│   │   └── Transaction.ts    # Transaction model
│   ├── types/                # TypeScript definitions
│   └── hooks/                # Custom React hooks
├── public/                   # Static assets
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
├── next.config.js            # Next.js configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎨 UI Components

Built with shadcn/ui for a consistent and beautiful design:

- **Cards**: For displaying information in organized sections
- **Buttons**: Multiple variants for different actions
- **Forms**: Accessible form components with validation
- **Charts**: Interactive data visualization with Recharts
- **Modals**: For editing and creating transactions
- **Toasts**: User feedback and notifications

## 📊 Data Visualization

Powered by Recharts for beautiful, interactive charts:

- **Pie Charts**: Spending by category breakdown
- **Line Charts**: Income vs expenses over time
- **Bar Charts**: Monthly spending trends
- **Area Charts**: Budget tracking visualization

## 🗄️ Database Schema

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,           // Category name (unique)
  type: String,           // 'income' or 'expense'
  color: String,          // Hex color code
  icon: String,           // Emoji or icon
  createdAt: Date,
  updatedAt: Date
}
```

### Transactions Collection
```javascript
{
  _id: ObjectId,
  description: String,    // Transaction description
  amount: Number,         // Transaction amount
  type: String,           // 'income' or 'expense'
  categoryId: ObjectId,   // Reference to Category
  date: Date,             // Transaction date
  notes: String,          // Optional notes
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run setup        # Run setup script
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/personal-finance-visualizer

# Environment
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 🎯 Features Roadmap

### ✅ Implemented
- [x] Dashboard with financial overview
- [x] Transaction CRUD operations
- [x] Category management
- [x] Basic charts and visualizations
- [x] Responsive design
- [x] Modern UI components

### 🚧 In Progress
- [ ] User authentication
- [ ] Advanced analytics
- [ ] Budget tracking
- [ ] Export functionality

### 📋 Planned
- [ ] Recurring transactions
- [ ] Financial goals
- [ ] Multi-currency support
- [ ] Bank account integration
- [ ] Mobile app (React Native)
- [ ] Advanced reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use shadcn/ui components for consistency
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Documentation](https://nextjs.org/docs)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Recharts](https://recharts.org/) - Chart library
- [MongoDB](https://mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

**Personal Finance Visualizer** - Making financial management simple and beautiful! 💰📊 