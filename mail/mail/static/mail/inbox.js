document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});


// Show compose view and hide other views
function compose_email() {

  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}




function load_mailbox(mailbox) {
  //load emails based on the mailbo
  load_mailbox_emails(mailbox)
  
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Show the mailbox and hide other views
  
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
 
}


//Send Email.
document.addEventListener('DOMContentLoaded', function(){
  document.querySelector('#compose-form').onsubmit = function(){
    console.log("submiting form")
    recipents = document.querySelector('#compose-recipients').value
    subject = document.querySelector('#compose-subject').value
    body = document.querySelector('#compose-body').value
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipents,
          subject: subject,
          body: body
      })
    }).then(response => response.json()).then(result => {
        load_mailbox('sent')
        console.log(result.read);
      });
    return false
  }
})


//load emails for mailbox
function load_mailbox_emails(mailbox) {
  
  //Grab emails-view
  const emailsView = document.querySelector('#emails-view')
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      //create div to each email
      emailDiv = document.createElement('div')
      emailDiv.setAttribute("class","emaildiv")
      
      senderDiv = document.createElement('div')
      senderDiv.setAttribute("class","senderdiv")
      senderDiv.innerHTML = email.sender
      //Create Subject div
      subjectDiv = document.createElement('div')
      subjectDiv.setAttribute("class","subjectdiv")
      subjectDiv.innerHTML = `Subject:${email.subject}`
      //Create timestamp Div
      timestampDiv = document.createElement('div')
      timestampDiv.setAttribute("class","timestampdiv")
      timestampDiv.innerHTML = email.timestamp
      if (mailbox === "sent"){
        //add divs to email div
        emailDiv.append(senderDiv, subjectDiv, timestampDiv);
      } 

      //if inbox
      if (mailbox === "inbox") {
        //add a class for readed emails
        if (email.read){
          emailDiv.classList.add("unreadstyle")
        } else {
          emailDiv.classList.add("readstyle")
        }
        // create a archive button
        archivedBtn = document.createElement('button')
        archivedBtn.setAttribute("class","archived-btn")
        archivedBtn.innerHTML = "Archive"
        archivedBtn.addEventListener('click', () => archive_email(email))
           //add divs to email div
        emailDiv.append(senderDiv, subjectDiv, archivedBtn, timestampDiv);
      }
      //sent view
      
      //arquive view
      if (mailbox === "archive"){
        // create a archive button
        archivedBtn = document.createElement('button')
        archivedBtn.setAttribute("class","archived-btn")
        archivedBtn.innerHTML = "Unarchived"
        archivedBtn.addEventListener('click', () => archive_email(email))
           //add divs to email div
        emailDiv.append(senderDiv, subjectDiv, archivedBtn, timestampDiv);
      }

      //if click on div but not in the archive button
      emailDiv.addEventListener('click', (event) => {
        if (event.target.className !== "archived-btn"){
          view_Email(email)
        }
      })
      //add email div to emails view
      emailsView.append(emailDiv);
    });
  })
}




//View Email

function view_Email(email){
  // Show the mailbox and hide other views
  console.log(`read:${email.read}`)
  console.log(`archived:${email.archived}`)
  if(email.read){  
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
    console.log("LEU!!!!!!!!!!!!!!")
  }
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';
  document.querySelector('#from-div').innerHTML = `<strong>From:</strong> ${email.sender}`
  document.querySelector('#to-div').innerHTML = `<strong>To:</strong> ${email.recipents}`
  document.querySelector('#subject-div').innerHTML = `<strong>Subject:</strong> ${email.subject}`
  document.querySelector('#timestamp-div').innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`
  document.querySelector('#emailbody-div').innerHTML = `${email.body}`
  document.querySelector('#reply-btn').addEventListener('click', function() {
  })
}


//archive/ unarchived email
async function archive_email(email){
  if (!email.archived){
    console.log("archiving email")
    await fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    })
    load_mailbox('inbox')
  } else {
    console.log("unarchiving email")
    await fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: false
      })
    })
    load_mailbox('archive')
  }
  console.log("aaaaaaaaa")
  
}