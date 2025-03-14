//
//
//
//
//
//
async function deleteUser (user_id){
    try{
        const response = await fetch(`/admin/user/${user_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 200) {
            console.log("user deleted");
            location.reload();
          } else {
            console.error("Bad request");
          }
    }catch (error){
        console.error("error deleting user", error);

    }
}

document.addEventListener('DOMContentLoaded', function() {
var deletebuttons = document.querySelectorAll(".delete-button");

    deletebuttons.forEach(function (deletebutton){
        var user_id = deletebutton.closest(".user-container").id;
        deletebutton.addEventListener('click', function(){
            deleteUser(user_id);
            //deletebutton.closest(".user-container").remove();
        });
    })
})