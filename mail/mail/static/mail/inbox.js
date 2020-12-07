document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});


// Show compose view and hide other views
function compose_email(reply=false, preFillContent=null) {

  document.querySelector('#view-email').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  
  if (reply){
    console.log(preFillContent)
    document.querySelector('#compose-recipients').value = preFillContent[0];
    let substring1 = preFillContent[1].substring(0,3)
    console.log(substring1)
    if (preFillContent[1].substring(0,3) === "Re:"){
      document.querySelector('#compose-subject').value = `${preFillContent[1]}`;
    }else{
      document.querySelector('#compose-subject').value = `Re: ${preFillContent[1]}`;
    }
    document.querySelector('#compose-body').value = `On ${preFillContent[2]}, ${preFillContent[0]} wrote: ${preFillContent[3]}` ;
  } else {
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  //send email
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
        console.log(result);
      });
    return false  
  }
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
function send_email(){
  
}




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
      
      console.log(`inbox: ${email.read} ${email.subject}`)
        if (!email.read){
          //if unread
          emailDiv.classList.add("unreadstyle")
        } else { //if read
          console.log("why?")
          emailDiv.classList.add("readstyle")
        }

      if (mailbox === "sent"){
        //add divs to email div
        console.log(`sent: ${email.read} ${email.subject}`)
        emailDiv.append(senderDiv, subjectDiv, timestampDiv);
      } 

      //if inbox
      if (mailbox === "inbox") {
        //add a class for readed emails
        
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
          console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
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
  console.log("QUEISSOCARA")
  console.log(`read:${email.read}`)
  console.log(`archived:${email.archived}`)
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  console.log("LEU!!!!!!!!!!!!!!")
  
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view-email').style.display = 'block';
  document.querySelector('#from-div').innerHTML = `<strong>From:</strong> ${email.sender}`
  document.querySelector('#to-div').innerHTML = `<strong>To:</strong> ${email.recipients}`
  document.querySelector('#subject-div').innerHTML = `<strong>Subject:</strong> ${email.subject}`
  document.querySelector('#timestamp-div').innerHTML = `<strong>Timestamp:</strong> ${email.timestamp}`
  document.querySelector('#emailbody-div').innerHTML = `${email.body}`
  document.querySelector('#reply-btn').addEventListener('click', function() {
    const preFillContent = [email.sender, email.subject, email.timestamp, email.body]
    compose_email(reply=true, preFillContent)
  })
  
  if (email.archived){
    archiveBtn = document.querySelector('#archive-btn-email-view')
    archiveBtn.innerHTML = "Unarchive"
    archiveBtn.setAttribute('class', 'btn-warning')
    archiveBtn.classList.add("btn") 
    archiveBtn.onclick = () => archive_email(email)
  } else {
    archiveBtn = document.querySelector('#archive-btn-email-view')
    archiveBtn.innerHTML = "Archive"
    archiveBtn.setAttribute('class', "btn-secondary")
    archiveBtn.classList.add("btn")
    archiveBtn.onclick = () => archive_email(email)
  }
  
  
}


//archive/ unarchived email
async function archive_email(email){
  if (!email.archived){
  try {
    await fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: true
      })
    }).then(() => load_mailbox('inbox')).then(()=>console.log("arquived"))
  } catch (error) {
    console.log(error)
  }
    
  } else {
    try {
      await fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      }).then(() => load_mailbox('inbox')).then(()=>console.log("unarquived"))
    } catch (error) {
      console.log(error)
    }
  }
}