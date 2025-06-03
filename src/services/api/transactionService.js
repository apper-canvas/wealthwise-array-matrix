import transactionData from '../mockData/transaction.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = [...transactionData];

const transactionService = {
  async getAll() {
    await delay(300);
    return [...data];
  },

  async getById(id) {
    await delay(200);
    const item = data.find(transaction => transaction.id === id);
    return item ? { ...item } : null;
  },

  async create(transaction) {
    await delay(400);
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: transaction.date || new Date().toISOString()
    };
    data.unshift(newTransaction);
    return { ...newTransaction };
  },

  async update(id, updatedData) {
    await delay(350);
    const index = data.findIndex(transaction => transaction.id === id);
    if (index === -1) throw new Error('Transaction not found');
    
    data[index] = { ...data[index], ...updatedData };
    return { ...data[index] };
  },

  async delete(id) {
    await delay(250);
    const index = data.findIndex(transaction => transaction.id === id);
    if (index === -1) throw new Error('Transaction not found');
    
    const deleted = data.splice(index, 1)[0];
    return { ...deleted };
  }
};

export default transactionService;