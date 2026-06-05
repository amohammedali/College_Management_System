import axios from 'axios';

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'kamran@gmail.com',
      password: 'staff123'
    });
    console.log('SUCCESS:', res.data);
  } catch (e: any) {
    console.log('ERROR:', e.response?.status, e.response?.data);
    if (!e.response) console.log('CONNECTION REFUSED - Backend likely not running');
  }
}

testLogin().then(() => process.exit(0));
