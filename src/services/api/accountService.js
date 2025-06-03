import accountData from '../mockData/account.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = [...accountData];

const accountService = {
  async getAll() {
    await delay(250);
    return [...data];
  },

  async getById(id) {
    await delay(200);
    const item = data.find(account => account.id === id);
    return item ? { ...item } : null;
  },

  async create(account) {
    await delay(400);
    const newAccount = {
      ...account,
      id: Date.now().toString(),
      lastSync: new Date().toISOString()
    };
    data.push(newAccount);
    return { ...newAccount };
  },

  async update(id, updatedData) {
    await delay(350);
    const index = data.findIndex(account => account.id === id);
    if (index === -1) throw new Error('Account not found');
    
    data[index] = { ...data[index], ...updatedData, lastSync: new Date().toISOString() };
    return { ...data[index] };
  },

  async delete(id) {
    await delay(250);
    const index = data.findIndex(account => account.id === id);
    if (index === -1) throw new Error('Account not found');
    
    const deleted = data.splice(index, 1)[0];
    return { ...deleted };
  }
};

export default accountService;