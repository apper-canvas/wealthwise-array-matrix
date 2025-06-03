import goalData from '../mockData/goal.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let data = [...goalData];

const goalService = {
  async getAll() {
    await delay(320);
    return [...data];
  },

  async getById(id) {
    await delay(200);
    const item = data.find(goal => goal.id === id);
    return item ? { ...item } : null;
  },

  async create(goal) {
    await delay(500);
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      milestones: goal.milestones || []
    };
    data.push(newGoal);
    return { ...newGoal };
  },

  async update(id, updatedData) {
    await delay(400);
    const index = data.findIndex(goal => goal.id === id);
    if (index === -1) throw new Error('Goal not found');
    
    data[index] = { ...data[index], ...updatedData };
    return { ...data[index] };
  },

  async delete(id) {
    await delay(280);
    const index = data.findIndex(goal => goal.id === id);
    if (index === -1) throw new Error('Goal not found');
    
    const deleted = data.splice(index, 1)[0];
    return { ...deleted };
  }
};

export default goalService;