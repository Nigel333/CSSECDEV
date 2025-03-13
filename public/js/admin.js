//
//
//
//
//
//
async function deleteUser (user_id){
    try{
        const response = await fetch(`admin/user/${user_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }catch (error){
        console.error("error deleting user", error);

    }
}

document.addEventListener('DOMContentLoaded', function() {
var deletebutton = document.querySelectorAll('.delete-user');

    deletebutton.forEach(function (deletebutton){
        var user_id = deletebutton.closest(".user-container").id;
        deletebutton.addEventListener('click', function(){
            deleteUser(user_id);
            deletebutton.closest(".user-container").remove();
        });
    })
})