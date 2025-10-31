-- Add admin role for the registered user
INSERT INTO user_roles (user_id, role) 
VALUES ('95584a99-6695-42f4-8e3d-1218ba91a8bc', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;