import userData from '../mockData/user.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = [...userData];

const userService = {
  async getAll() {
    await delay(200);
    return [...data];
  },

  async getById(id) {
    await delay(150);
    const item = data.find(user => user.id === id);
    return item ? { ...item } : null;
  },

  async create(user) {
    await delay(350);
    const newUser = {
      ...user,
      id: Date.now().toString(),
      preferences: user.preferences || {}
    };
    data.push(newUser);
    return { ...newUser };
  },

  async update(id, updatedData) {
    await delay(300);
    const index = data.findIndex(user => user.id === id);
    if (index === -1) throw new Error('User not found');
    
    data[index] = { ...data[index], ...updatedData };
    return { ...data[index] };
  },

  async delete(id) {
    await delay(250);
    const index = data.findIndex(user => user.id === id);
    if (index === -1) throw new Error('User not found');
    
    const deleted = data.splice(index, 1)[0];
    return { ...deleted };
  }
};

export default userService;