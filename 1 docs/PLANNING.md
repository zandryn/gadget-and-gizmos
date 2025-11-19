# project planning

## purpose
Document and showcase my collection of tech and their info through a fun website. 

## my wants 
- add new devices easily so I don't procrastinate documenting them
- track repair costs so I can see how much I've saved vs buying new
- upload photos so I can remember the journey
- search/filter my devices so I can find things quickly
- see a timeline of repairs so I know when maintenance is due
- petty cards so it feels like a digital collection binder

## phase 1 - MVP features
- CRUD (create, read, update, delete) for devices
- basic grid layout for frontend
- form to add devices
- photo upload with single main upload 
- basic device info display

## phase 2 - make it pretty 
- polaroid-style cards with hover effects
- color coding by device type
- photo galleries (multiple photos per device)
- repair journeys 
- total investment calculator

## phase 3 - add enhancements 
- automation scripts for common tasks
- market price API integration (eBay/etc)??
- backup/restore functionality??
- share device cards

## database design decisions
- MongoDB for flexible schema since cameras have different fields than laptops
- each device is a document with nested repair history
- photos stored as URLs 

## learning goals 
- better understand NoSQL vs SQL
- learn FastAPI best practices
- practice responsive design
- pratice API documentation