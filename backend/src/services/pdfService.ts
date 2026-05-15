import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

export const generatePromotionLetter = async (faculty: any, cycle: any, criteria: any) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 50px; }
          .title { font-size: 24px; font-weight: bold; text-decoration: underline; }
          .content { margin-bottom: 30px; }
          .details { margin-bottom: 20px; }
          .footer { margin-top: 50px; }
          .sig-box { margin-top: 100px; display: flex; justify-content: space-between; }
          .status { color: ${criteria.eligible ? 'green' : 'red'}; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">PROMOTION ELIGIBILITY REPORT</div>
          <p>Academic Cycle: ${cycle.cycleYear}</p>
        </div>
        
        <div class="content">
          <p><strong>Faculty Name:</strong> ${faculty.name}</p>
          <p><strong>Designation:</strong> ${faculty.designation}</p>
          <p><strong>Department:</strong> ${faculty.department}</p>
          <hr/>
          <h3>Performance Summary:</h3>
          <ul>
            <li>API Score: ${cycle.apiScore} (Required: ${criteria.criteria.apiScore.required})</li>
            <li>Years of Service: ${criteria.criteria.yearsService.actual} (Required: ${criteria.criteria.yearsService.required})</li>
            <li>Research Publications: ${criteria.criteria.researchCount.actual} (Required: ${criteria.criteria.researchCount.required})</li>
            <li>PhD Status: ${faculty.hasPhd ? 'Completed' : 'Not Completed'}</li>
          </ul>
          <p><strong>Overall Eligibility:</strong> <span class="status">${criteria.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}</span></p>
        </div>

        <div class="footer">
          <p>This report is generated based on verified records in the Institutional Management System.</p>
        </div>

        <div class="sig-box">
          <div>
            <hr width="200px"/>
            <p>Head of Department</p>
          </div>
          <div>
            <hr width="200px"/>
            <p>Principal</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();

  const fileName = `Promotion_Report_${faculty._id}_${cycle.cycleYear}.pdf`;
  const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
  
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  fs.writeFileSync(filePath, pdfBuffer);
  return `/uploads/reports/${fileName}`;
};

export const generateApiMatrix = async (year: string, dept: string, data: any[]) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 20px; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .header { text-align: center; margin-bottom: 20px; }
          .badge { padding: 4px 8px; border-radius: 4px; color: white; font-weight: bold; }
          .grade-A-plus { background-color: #2ecc71; }
          .grade-A { background-color: #27ae60; }
          .grade-B-plus { background-color: #f1c40f; }
          .grade-B { background-color: #e67e22; }
          .grade-C { background-color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>API Score Matrix - ${year}</h1>
          <p>Department: ${dept || 'All Departments'}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Designation</th>
              <th>Academic</th>
              <th>Research</th>
              <th>Feedback</th>
              <th>Admin</th>
              <th>Total API</th>
              <th>Grade</th>
              <th>Eligible</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                <td>${row.faculty.name}</td>
                <td>${row.faculty.designation}</td>
                <td>${row.academicScore}</td>
                <td>${row.researchScore}</td>
                <td>${row.feedbackScore}</td>
                <td>${row.adminScore}</td>
                <td><strong>${row.apiScore}</strong></td>
                <td><span class="badge grade-${row.apiGrade.replace('+', '-plus')}">${row.apiGrade}</span></td>
                <td>${row.promotionEligible ? 'Yes' : 'No'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: 'A4', landscape: true });
  await browser.close();

  const fileName = `API_Matrix_${year}_${dept || 'all'}.pdf`;
  const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
  
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  fs.writeFileSync(filePath, pdfBuffer);
  return `/uploads/reports/${fileName}`;
};
