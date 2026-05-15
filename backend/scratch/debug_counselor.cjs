const axios = require('axios');

async function debug() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'kamran@gmail.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    const auth = { headers: { Authorization: `Bearer ${token}` } };

    console.log('Login Successful');

    // 2. Get Profile
    const profileRes = await axios.get('http://localhost:5000/api/staff/profile', auth);
    const profile = profileRes.data;
    console.log('Profile:', { 
      name: profile.name, 
      dept: profile.department, 
      year: profile.assignedYear, 
      sec: profile.assignedSection 
    });

    // 3. Get Subjects
    const assignedYearNum = profile.assignedYear ? parseInt(profile.assignedYear.match(/\d+/) ? profile.assignedYear.match(/\d+/)[0] : '0') : 0;
    const sem = assignedYearNum * 2 - 1;
    console.log('Querying for Sem:', sem);
    const subjectsRes = await axios.get(`http://localhost:5000/api/staff/available-subjects?department=${profile.department}&regulation=2023&semester=${sem}`, auth);
    console.log('Subjects Found:', subjectsRes.data.length);
    subjectsRes.data.forEach(s => console.log(`- ${s.code}: ${s.name}`));

  } catch (err) {
    console.error('Debug Error:', err.response?.data || err.message);
  }
}

debug();
