class Contact {
  id: string;
  name: string;
  phone: string;
  email: string;

  constructor(id: string, name: string, phone: string, email: string) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.email = email;
  }
}

class ContactManager {
  contacts: Contact[] = [];

  constructor() {
    this.loadContacts();
  }

  loadContacts(): void {
    const contactsJson = localStorage.getItem('contacts');
    if (contactsJson) {
      const contactObjects = JSON.parse(contactsJson);
      this.contacts = contactObjects.map(
        (obj: any) => new Contact(obj.id, obj.name, obj.phone, obj.email)
      );
    } else {
      this.contacts = [];
    }
  }

  saveContacts(): void {
    localStorage.setItem('contacts', JSON.stringify(this.contacts));
  }

  addContact(contact: Contact): void {
    this.contacts.push(contact);
    this.saveContacts();
  }

  updateContact(updatedContact: Contact): void {
    this.contacts = this.contacts.map(contact =>
      contact.id === updatedContact.id ? updatedContact : contact
    );
    this.saveContacts();
  }

  deleteContact(id: string): void {
    this.contacts = this.contacts.filter(contact => contact.id !== id);
    this.saveContacts();
  }

  getContact(id: string): Contact | undefined {
    return this.contacts.find(contact => contact.id === id);
  }
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

function showNotification(message: string) {
  const notification = document.getElementById('notification')!;
  notification.textContent = message;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 2500);
}

function isValidKenyanPhoneNumber(phone: string): boolean {
  const regex = /^2547\d{8}$/;
  return regex.test(phone);
}


const contactManager = new ContactManager();

const form = document.getElementById('contact-form') as HTMLFormElement;
const nameInput = document.getElementById('name') as HTMLInputElement;
const phoneInput = document.getElementById('phone-number') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const contactTableBody = document.querySelector('#contact-table tbody') as HTMLTableSectionElement;

let editContactId: string | null = null;

function clearForm() {
  nameInput.value = '';
  phoneInput.value = '';
  emailInput.value = '';
  editContactId = null;
  form.querySelector('button')!.textContent = 'Save Contact';
}

function renderContacts() {
  contactTableBody.innerHTML = '';

  contactManager.contacts.forEach(contact => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${contact.name}</td>
      <td>${contact.phone}</td>
      <td>${contact.email}</td>
      <td class="actions">
        <button data-id="${contact.id}" class="edit-btn">Edit</button>
        <button data-id="${contact.id}" class="delete-btn">Delete</button>
      </td>
    `;

    contactTableBody.appendChild(tr);
  });

  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach(button =>
    button.addEventListener('click', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id')!;
      const contact = contactManager.getContact(id);
      if (contact) {
        nameInput.value = contact.name;
        phoneInput.value = contact.phone;
        emailInput.value = contact.email;
        editContactId = id;
        form.querySelector('button')!.textContent = 'Update Contact';
      }
    })
  );

  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button =>
    button.addEventListener('click', (e) => {
      const id = (e.target as HTMLElement).getAttribute('data-id')!;
      if (confirm('Are you sure you want to delete this contact?')) {
        contactManager.deleteContact(id);
        showNotification('Contact deleted successfully!')
        renderContacts();
        if (editContactId === id) clearForm();
      }
    })
  );
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !phone || !email) {
    alert('Please fill in all fields');
    return;
  }

    if (!isValidKenyanPhoneNumber(phone)) {
    alert('Phone number must start with 2547 followed by 8 digits.');
    return;
  }
  if (editContactId) {
    const updatedContact = new Contact(editContactId, name, phone, email);
    contactManager.updateContact(updatedContact);
    showNotification('Contact updated successfully!')
  } else {
    const newContact = new Contact(generateId(), name, phone, email);
    contactManager.addContact(newContact);
    showNotification('Contact saved successfully!')
  }

  clearForm();
  renderContacts();
});

renderContacts();
