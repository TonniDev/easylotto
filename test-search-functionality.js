// This is a simple script to test the search functionality
// Run this in the browser console when on the my-games page

// Function to test search functionality
function testSearchFunctionality() {
  console.log("Testing search functionality...");
  
  // Get the input elements
  const emailInput = document.getElementById('email');
  const nameInput = document.getElementById('name');
  const groupInput = document.getElementById('group');
  
  if (!emailInput || !nameInput || !groupInput) {
    console.error("Could not find all input elements");
    return;
  }
  
  // Test search with email
  console.log("\nTesting search with email...");
  const testEmail = "test@example.com";
  
  // Set email input value
  emailInput.value = testEmail;
  // Trigger the onChange event
  emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  // Wait for debounce and check URL
  setTimeout(() => {
    console.log("Current URL:", window.location.href);
    console.log("Expected to contain:", `email=${testEmail}`);
    
    // Test search with name
    console.log("\nTesting search with name...");
    const testName = "Test User";
    
    // Clear email input
    emailInput.value = "";
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Set name input value
    nameInput.value = testName;
    // Trigger the onChange event
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait for debounce and check URL
    setTimeout(() => {
      console.log("Current URL:", window.location.href);
      console.log("Expected to contain:", `name=${testName}`);
      
      // Test search with group
      console.log("\nTesting search with group...");
      const testGroup = "Test Group";
      
      // Clear name input
      nameInput.value = "";
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Set group input value
      groupInput.value = testGroup;
      // Trigger the onChange event
      groupInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Wait for debounce and check URL
      setTimeout(() => {
        console.log("Current URL:", window.location.href);
        console.log("Expected to contain:", `group=${testGroup}`);
        
        // Test search with multiple parameters
        console.log("\nTesting search with multiple parameters...");
        
        // Set email and name input values
        emailInput.value = testEmail;
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        nameInput.value = testName;
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Wait for debounce and check URL
        setTimeout(() => {
          console.log("Current URL:", window.location.href);
          console.log("Expected to contain:", `email=${testEmail}`, "and", `name=${testName}`);
          
          // Clear all inputs
          console.log("\nClearing all inputs...");
          
          emailInput.value = "";
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          nameInput.value = "";
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          groupInput.value = "";
          groupInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          // Wait for debounce and check URL
          setTimeout(() => {
            console.log("Current URL:", window.location.href);
            console.log("Expected to be:", "/my-games");
            
            console.log("\nTest completed.");
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}

// Run the test
testSearchFunctionality();
