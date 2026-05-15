const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:5000/api/timetable/faculty/available?day=Mon&period=1');
    console.log('Available Faculty:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
