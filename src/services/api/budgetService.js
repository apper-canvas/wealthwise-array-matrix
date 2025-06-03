import budgetData from '../mockData/budget.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = [...budgetData];

const budgetService = {
  async getAll() {
    await delay(280);
    return [...data];
  },

  async getById(id) {
    await delay(200);
    const item = data.find(budget => budget.id === id);
    return item ? { ...item } : null;
  },

  async create(budget) {
    await delay(450);
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
      startDate: budget.startDate || new Date().toISOString(),
      endDate: budget.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    data.push(newBudget);
    return { ...newBudget };
  },

  async update(id, updatedData) {
    await delay(380);
    const index = data.findIndex(budget => budget.id === id);
    if (index === -1) throw new Error('Budget not found');
    
    data[index] = { ...data[index], ...updatedData };
    return { ...data[index] };
  },

  async delete(id) {
    await delay(300);
    const index = data.findIndex(budget => budget.id === id);
    if (index === -1) throw new Error('Budget not found');
    
    const deleted = data.splice(index, 1)[0];
    return { ...deleted };
  }
};

export default budgetService;