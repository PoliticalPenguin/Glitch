CREATE DATABASE glitch;

USE glitch;

CREATE TABLE users (
  id int(8) PRIMARY KEY AUTO_INCREMENT,
  username varchar(20),
  password varchar(20),
  salt varchar(20)
);

CREATE TABLE messages (
  id int(8) PRIMARY KEY AUTO_INCREMENT,
  text varchar(100),
  user_id int(8) REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE songs (
  id int(8) PRIMARY KEY AUTO_INCREMENT,
  location varchar(30),
  duration int(6),
  artist varchar(20),
  title varchar(20)
);