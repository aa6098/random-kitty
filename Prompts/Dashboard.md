Create a dashboard page in (protected) folder.
This should be available to logged in user only
Add a search drop drop to show following values
'10 miles" value 10
'25 miles" value 25
'50 miles" value 50
'100 miles" value 100
'Any Distance" value 0

Use the locationId of currently logged in user.
Search the other members who location is within that distance.
The logic should be find the set of location Id within the distance of logged member location Id.
The search the members in the above set of location ids.
Do not select logged in member own record.
Do not select record if the combination of target record Member Id and logged in member Id are in BlockUser model.
Do not select the member with Deactivated as true.
Display the result in DashboardMember component.
The Dashboard member should be grid with two columns in 30-70 ratio.
on left column show the member.image.
On right column show member information
Description as About us.
What we are looking for.
Location as City, State.
Member since based on CreatedAt date in Member record.
Show DashboardMember per row in Dashboard page