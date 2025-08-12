// This is a simple script to test the input fix
// Run this in the browser console when on the my-games page

// Function to test input behavior
function testInputBehavior() {
  console.log("Testing input behavior...");
  
  // Get the input elements
  const emailInput = document.getElementById('email');
  const nameInput = document.getElementById('name');
  const groupInput = document.getElementById('group');
  
  if (!emailInput || !nameInput || !groupInput) {
    console.error("Could not find all input elements");
    return;
  }
  
  console.log("Initial values:");
  console.log("Email:", emailInput.value);
  console.log("Name:", nameInput.value);
  console.log("Group:", groupInput.value);
  
  // Test changing values
  console.log("\nChanging values...");
  
  // Simulate user typing in the email input
  const newEmailValue = "test@example.com";
  emailInput.value = newEmailValue;
  // Trigger the onChange event
  const emailEvent = new Event('input', { bubbles: true });
  emailInput.dispatchEvent(emailEvent);
  
  // Simulate user typing in the name input
  const newNameValue = "Test User";
  nameInput.value = newNameValue;
  // Trigger the onChange event
  const nameEvent = new Event('input', { bubbles: true });
  nameInput.dispatchEvent(nameEvent);
  
  // Simulate user typing in the group input
  const newGroupValue = "Test Group";
  groupInput.value = newGroupValue;
  // Trigger the onChange event
  const groupEvent = new Event('input', { bubbles: true });
  groupInput.dispatchEvent(groupEvent);
  
  // Check if the values were updated
  setTimeout(() => {
    console.log("\nValues after change:");
    console.log("Email:", emailInput.value);
    console.log("Name:", nameInput.value);
    console.log("Group:", groupInput.value);
    
    // Test clearing values
    console.log("\nClearing values...");
    
    // Clear email input
    emailInput.value = "";
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Clear name input
    nameInput.value = "";
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Clear group input
    groupInput.value = "";
    groupInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Check if the values were cleared
    setTimeout(() => {
      console.log("\nValues after clearing:");
      console.log("Email:", emailInput.value);
      console.log("Name:", nameInput.value);
      console.log("Group:", groupInput.value);
      
      console.log("\nTest completed.");
    }, 1000);
  }, 1000);
}

// Run the test
testInputBehavior();
