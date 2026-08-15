INSERT INTO domains (slug, name) VALUES
('ai', 'AI'),
('machine-learning', 'Machine Learning'),
('web-development', 'Web Development'),
('mobile-development', 'Mobile Development'),
('devops', 'DevOps'),
('cloud', 'Cloud'),
('cybersecurity', 'Cybersecurity'),
('blockchain', 'Blockchain'),
('game-development', 'Game Development'),
('data-science', 'Data Science'),
('databases', 'Databases'),
('developer-tools', 'Developer Tools'),
('education', 'Education'),
('computer-vision', 'Computer Vision'),
('nlp', 'NLP'),
('robotics', 'Robotics'),
('iot', 'IoT')
ON CONFLICT (slug) DO NOTHING;
