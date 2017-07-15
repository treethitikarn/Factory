-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: factory
-- ------------------------------------------------------
-- Server version	5.7.17-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `RegionId` int(11) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` varchar(60) DEFAULT NULL,
  `SubDistrict` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `Province` varchar(100) DEFAULT NULL,
  `PostCode` varchar(10) DEFAULT NULL,
  `Transporter` varchar(100) DEFAULT NULL,
  `TransporterPhone` varchar(15) DEFAULT NULL,
  `EmployeeId` int(11) DEFAULT NULL,
  `IsUpdated` tinyint(1) DEFAULT NULL,
  `DateTime` datetime DEFAULT NULL,
  `credit` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customerproductprice`
--

DROP TABLE IF EXISTS `customerproductprice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customerproductprice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ProductId` int(11) NOT NULL,
  `CustomerId` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customerproductprice`
--

LOCK TABLES `customerproductprice` WRITE;
/*!40000 ALTER TABLE `customerproductprice` DISABLE KEYS */;
/*!40000 ALTER TABLE `customerproductprice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) NOT NULL,
  `IsAdmin` tinyint(1) NOT NULL,
  `Password` varchar(200) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `AuthenToken` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'eagle1',1,'$2a$10$pPMMn9euzqa/B2QdIkytdekX/.Ci9sQLVi/XkxpsoGPvyeQjlMRrK','eagle1',NULL),(2,'eagle2',1,'$2a$10$2pXJ2w6/qusS8K9gbo8BLuHizzRk/poxySo9gXLTkIa4N./s2qaLy','eagle2',NULL),(3,'eagle3',1,'$2a$10$KHnT3uZp7UUIHFl5BzjmJu5U0z4Y7g2a.dzgQnHrt7GgcK.iBh1jy','eagle3',NULL),(4,'eagle4',1,'$2a$10$m3bpgmMiJeQ0LfSVRresI.j2wrSiRiC/Oo6PhZ601scjkiIh5ZIdi','eagel4',NULL),(5,'eagle5',1,'$2a$10$fG7of6qivQlaHctoBeYwLuTY.0rX2qdvj/Nc.gCPAl/RZ7p5myjvS','eagle5',NULL),(6,'eagle6',1,'$2a$10$MM/XLU7pZF9S0GMbeeJ2VO6sKyROhdewFkSUIufMxoKjCsXJ3XdjG','eagle6',NULL),(7,'eagle7',1,'$2a$10$SIe9dfJF0nF9onhKa90v7OBBSHB6vihS0wxUDusnx9NpvcH8hB8Wq','eagle7',NULL),(8,'eagle8',1,'$2a$10$WCOdqBABbavzo3IhtXWNAuYFgsrn926.ahVQxasJen8u7NW3eRMbO','eagle8',NULL),(9,'eagle9',1,'$2a$10$l/DWYDtRywjKGXRWWMEiUe0OaO12T14kBnHGrHL.p/Mc.doJnqNaK','eagle9',NULL),(10,'eagle10',1,'$2a$10$kK3P6KNaXoq7WJ66AyGLgeRg.dUnxo2WSq/DpAgbphjRffMwSln9y','eagle10',NULL);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `material`
--

DROP TABLE IF EXISTS `material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `material` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `materialtypeid` int(11) NOT NULL,
  `datetime` datetime NOT NULL,
  `amount` int(11) NOT NULL,
  `employeeid` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `material`
--

LOCK TABLES `material` WRITE;
/*!40000 ALTER TABLE `material` DISABLE KEYS */;
/*!40000 ALTER TABLE `material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materialtransaction`
--

DROP TABLE IF EXISTS `materialtransaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `materialtransaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `materialid` int(11) NOT NULL,
  `datetime` datetime NOT NULL,
  `acquire` int(11) NOT NULL,
  `use` int(11) NOT NULL,
  `balance` int(11) NOT NULL,
  `employeeid` int(11) NOT NULL,
  `isupdated` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materialtransaction`
--

LOCK TABLES `materialtransaction` WRITE;
/*!40000 ALTER TABLE `materialtransaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialtransaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materialtype`
--

DROP TABLE IF EXISTS `materialtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `materialtype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materialtype`
--

LOCK TABLES `materialtype` WRITE;
/*!40000 ALTER TABLE `materialtype` DISABLE KEYS */;
INSERT INTO `materialtype` VALUES (1,'เม็ดเป่า'),(2,'เม็ดฉีด');
/*!40000 ALTER TABLE `materialtype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order`
--

DROP TABLE IF EXISTS `order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customerid` int(11) NOT NULL,
  `datetime` datetime NOT NULL,
  `employeeid` int(11) NOT NULL,
  `isupdated` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order`
--

LOCK TABLES `order` WRITE;
/*!40000 ALTER TABLE `order` DISABLE KEYS */;
/*!40000 ALTER TABLE `order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderdetails`
--

DROP TABLE IF EXISTS `orderdetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orderdetails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderid` int(11) NOT NULL,
  `priceperpiece` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `employeeid` int(11) NOT NULL,
  `isupdated` tinyint(1) DEFAULT NULL,
  `datetime` datetime NOT NULL,
  `productid` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderdetails`
--

LOCK TABLES `orderdetails` WRITE;
/*!40000 ALTER TABLE `orderdetails` DISABLE KEYS */;
/*!40000 ALTER TABLE `orderdetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(45) NOT NULL,
  `ProductTypeId` int(11) NOT NULL,
  `Amount` int(11) NOT NULL,
  `Cost` int(11) NOT NULL,
  `EmployeeId` int(11) NOT NULL,
  `imageurl` varchar(500) DEFAULT NULL,
  `IsUpdated` tinyint(1) DEFAULT NULL,
  `InsertedDate` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producttransaction`
--

DROP TABLE IF EXISTS `producttransaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `producttransaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `amount` int(11) NOT NULL,
  `employeeId` int(11) NOT NULL,
  `transactionDate` datetime NOT NULL,
  `productId` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producttransaction`
--

LOCK TABLES `producttransaction` WRITE;
/*!40000 ALTER TABLE `producttransaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `producttransaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `producttype`
--

DROP TABLE IF EXISTS `producttype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `producttype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `EmployeeId` int(11) NOT NULL,
  `IsUpdated` tinyint(1) DEFAULT NULL,
  `DateTime` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `producttype`
--

LOCK TABLES `producttype` WRITE;
/*!40000 ALTER TABLE `producttype` DISABLE KEYS */;
INSERT INTO `producttype` VALUES (1,'ไม่มีประเภท',0,NULL,'2017-06-18 00:57:44');
/*!40000 ALTER TABLE `producttype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `region`
--

DROP TABLE IF EXISTS `region`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `region` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='		';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `region`
--

LOCK TABLES `region` WRITE;
/*!40000 ALTER TABLE `region` DISABLE KEYS */;
INSERT INTO `region` VALUES (1,'เหนือ'),(2,'กลาง'),(3,'ตะวันออกเฉียงเหนือ'),(4,'ตะวันออก'),(5,'ตะวันตก'),(6,'ใต้');
/*!40000 ALTER TABLE `region` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-07-15 21:57:43
