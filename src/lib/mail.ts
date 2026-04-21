/**
 * Mail utility for JV Vault
 * Currently logs to console, but can be easily switched to a real provider like Nodemailer or Resend.
 */

export async function sendTaskAssignmentEmail(data: {
  to: string;
  taskTitle: string;
  clientName: string;
  dueDate: string | null;
  creatorEmail: string;
}) {
  const { to, taskTitle, clientName, dueDate, creatorEmail } = data;
  
  const subject = `[JV Vault] New Task Assigned: ${taskTitle}`;
  const body = `
    Hi,
    
    You have been assigned a new task in JV Vault.
    
    Task: ${taskTitle}
    Client: ${clientName}
    Due Date: ${dueDate || "No deadline"}
    Assigned By: ${creatorEmail}
    
    Login to JV Vault to view more details and collaborate.
  `;

  console.log("------------------------------------------");
  console.log(`SENDING EMAIL TO: ${to}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`BODY: ${body}`);
  console.log("------------------------------------------");

  // In a real app, you'd do:
  // await resend.emails.send({ from: 'vault@jaiveeru.co.in', to, subject, html: body });
  
  return { success: true };
}
