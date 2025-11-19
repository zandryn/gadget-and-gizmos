# data structure

## device fields by type

### all devices have:
- (date) adopted_date 
- (string) nickname 
- (string) model 
- (string) brand 
- (string) source 
- (string) main_photo 
- (string) notes 
- (string) device_type {type}
- (string) status {type}
- (double) purchase_price 
- (double) current_value 

### computers also have:
- cpu
- ram  
- storage
- os
- battery_model

### cameras also have:
- sensor_type
- lens_mount
- megapixels
- film_type (if applicable)

### personal tech also have:
- battery_life
- connectivity (wifi/bluetooth/etc)

## repair event structure:
- date
- type (repair/upgrade/maintenance)  
- description
- parts_used [{name, cost}]
- time_spent
- photos_before_after
