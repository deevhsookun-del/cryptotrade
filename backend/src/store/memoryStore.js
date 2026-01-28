// backend/src/store/memoryStore.js
const users = []; // { id, name, email, passwordHash }
let nextId = 1;

function getNextId() {
  return nextId++;
}

module.exports = { users, getNextId };
