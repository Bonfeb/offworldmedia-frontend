import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  TextareaAutosize,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Check,
  Videocam,
  CameraAlt,
  Movie,
  Radio,
  Campaign,
  Laptop,
  Place,
  Phone,
  Email,
  Schedule,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube
} from '@mui/icons-material';

const NewHomeUI = () => {
  const [activeTab, setActiveTab] = useState('vision');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    }
  };

  // Data arrays for different sections
  const services = [
    {
      id: 1,
      title: "Video Production",
      description: "Full-service video production from concept to completion.",
      icon: <Videocam color="primary" fontSize="large" />,
      features: ["Documentaries & Short Films", "Corporate Videos", "Commercials & Advertisements"]
    },
    {
      id: 2,
      title: "Photography",
      description: "Professional photography services for various purposes.",
      icon: <CameraAlt color="primary" fontSize="large" />,
      features: ["Commercial & Product", "Event Coverage", "Aerial & Drone"]
    },
    {
      id: 3,
      title: "Post-Production",
      description: "Comprehensive post-production services.",
      icon: <Movie color="primary" fontSize="large" />,
      features: ["Video Editing", "Motion Graphics", "Sound Design"]
    },
    {
      id: 4,
      title: "Live Production",
      description: "Professional live event production services.",
      icon: <Radio color="primary" fontSize="large" />,
      features: ["Multi-Camera Events", "Live Streaming", "Virtual Events"]
    },
    {
      id: 5,
      title: "Content Strategy",
      description: "Strategic planning of media content.",
      icon: <Campaign color="primary" fontSize="large" />,
      features: ["Content Strategy", "Storyboarding", "Distribution Planning"]
    },
    {
      id: 6,
      title: "Digital Media",
      description: "Specialized content for online platforms.",
      icon: <Laptop color="primary" fontSize="large" />,
      features: ["Social Media", "Web Videos", "Interactive Media"]
    }
  ];

  const contactInfo = [
    { icon: <Place color="primary" />, title: "Our Location", content: ["123 Media Plaza, Victoria Island", "Lagos, Nigeria"] },
    { icon: <Phone color="primary" />, title: "Phone Number", content: ["+234 (0) 123 456 7890", "+234 (0) 987 654 3210"] },
    { icon: <Email color="primary" />, title: "Email Address", content: ["info@offworldmedia.africa", "projects@offworldmedia.africa"] },
    { icon: <Schedule color="primary" />, title: "Working Hours", content: ["Monday-Friday: 8AM-6PM", "Saturday: 9AM-1PM"] }
  ];

  const socialLinks = [
    { icon: <Facebook />, href: "#" },
    { icon: <Twitter />, href: "#" },
    { icon: <Instagram />, href: "#" },
    { icon: <LinkedIn />, href: "#" },
    { icon: <YouTube />, href: "#" }
  ];

  const portfolioItems = [
    {
      type: 'video',
      title: "Documentary Series: Voices of Africa",
      description: "Award-winning documentary series across East Africa.",
      embedId: "8wT5g-lwBAY"
    },
    {
      type: 'video',
      title: "Corporate Brand Film: TechAfrica",
      description: "Cinematic brand story for technology company.",
      embedId: "FPrCJcpVVJ4"
    },
    {
      type: 'image',
      title: "Tourism Campaign: Discover Ghana",
      description: "Showcasing Ghana's cultural heritage.",
      image: "https://images.unsplash.com/photo-1502920514313-52581002a659?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
    },
    {
      type: 'image',
      title: "Event Coverage: Africa Tech Summit",
      description: "Multi-camera production for tech conference.",
      image: "https://images.unsplash.com/photo-1495592822108-9e6261896da8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1533750516457-a7f992034fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          textAlign: 'center'
        }}
        id="home"
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2.5rem', md: '4rem' } }}>
              Bringing African Stories to the World
            </Typography>
            <Typography variant="h5" component="p" gutterBottom sx={{ mb: 4, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
              Professional media production services across the African continent
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => scrollToSection("services")}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Our Services
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  onClick={() => scrollToSection("contact")}
                  sx={{ px: 4, py: 1.5 }}
                >
                  Contact Us
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Welcome Section */}
      <Box sx={{ py: 10, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h3" component="h2" gutterBottom textAlign="center" sx={{ fontWeight: 700 }}>
              Welcome to Offworld Media Africa
            </Typography>
            <Divider sx={{ width: 80, height: 4, bgcolor: 'primary.main', mx: 'auto', mb: 4 }} />
            <Typography variant="body1" paragraph textAlign="center" sx={{ fontSize: '1.1rem' }}>
              At Offworld Media Africa, we are dedicated to showcasing the rich, diverse stories of Africa through world-class media production. Our team combines cutting-edge technology with deep cultural understanding to create compelling content.
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ fontSize: '1.1rem' }}>
              From documentary filmmaking to corporate video production, we deliver exceptional quality that elevates your message and connects with your audience.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* About Section */}
      <Box sx={{ py: 10, bgcolor: 'primary.light' }} id="about">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.dark' }}>
              About Us
            </Typography>
            <Divider sx={{ width: 80, height: 4, bgcolor: 'primary.main', mx: 'auto' }} />
          </motion.div>

          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card elevation={6} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="400"
                    image="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                    alt="Offworld Media Africa Team"
                  />
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card elevation={4} sx={{ borderRadius: 2 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} centered>
                      <Tab label="Our Vision" value="vision" />
                      <Tab label="Our Mission" value="mission" />
                    </Tabs>

                    <Box sx={{ mt: 3 }}>
                      {activeTab === 'vision' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
                            Our Vision
                          </Typography>
                          <Typography variant="body1" paragraph>
                            To be Africa's premier media production company, recognized globally for our authentic storytelling, technical excellence, and innovative approaches that reshape narratives about the African continent.
                          </Typography>
                          <Typography variant="body1">
                            We envision a world where African stories, perspectives, and talent are celebrated and valued in global media, contributing to a more balanced representation of our diverse continent.
                          </Typography>
                        </motion.div>
                      )}

                      {activeTab === 'mission' && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
                            Our Mission
                          </Typography>
                          <Typography variant="body1" paragraph>
                            To create high-quality, impactful media content that authentically portrays Africa's diversity, challenges, and triumphs. We are committed to:
                          </Typography>
                          <List>
                            {[
                              "Employing and developing local talent across the continent",
                              "Utilizing cutting-edge technology and techniques",
                              "Building partnerships that amplify African voices",
                              "Maintaining the highest standards of professionalism and ethics"
                            ].map((item, index) => (
                              <ListItem key={index} disableGutters>
                                <ListItemIcon>
                                  <Check color="primary" />
                                </ListItemIcon>
                                <ListItemText primary={item} />
                              </ListItem>
                            ))}
                          </List>
                        </motion.div>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 10, bgcolor: 'primary.light' }} id="services">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.dark' }}>
              Our Services
            </Typography>
            <Typography variant="subtitle1" paragraph sx={{ color: 'text.secondary' }}>
              Comprehensive media production services tailored to your specific needs
            </Typography>
            <Divider sx={{ width: 80, height: 4, bgcolor: 'primary.main', mx: 'auto' }} />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <Grid container spacing={4}>
              {services.map((service) => (
                <Grid item xs={12} sm={6} md={4} key={service.id}>
                  <motion.div variants={itemVariants}>
                    <Card elevation={4} sx={{ height: '100%', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.03)' } }}>
                      <CardContent sx={{ p: 4, height: '100%' }}>
                        <Box sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'primary.light',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3
                        }}>
                          {service.icon}
                        </Box>
                        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                          {service.title}
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                          {service.description}
                        </Typography>
                        <List dense>
                          {service.features.map((feature, index) => (
                            <ListItem key={index} disableGutters>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <Check color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={feature} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Showcase Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }} id="showcase">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
              Our Work
            </Typography>
            <Typography variant="subtitle1" paragraph sx={{ color: 'grey.300' }}>
              Explore our portfolio of projects showcasing our expertise in media production across Africa
            </Typography>
            <Divider sx={{ width: 80, height: 4, bgcolor: 'primary.main', mx: 'auto' }} />
          </motion.div>

          {/* Featured Videos */}
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h3" gutterBottom textAlign="center" sx={{ color: 'primary.light', mb: 4 }}>
              Featured Videos
            </Typography>
            <Grid container spacing={4}>
              {portfolioItems.filter(item => item.type === 'video').map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                  >
                    <Card elevation={6} sx={{ borderRadius: 2 }}>
                      <Box sx={{ position: 'relative', pt: '56.25%' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${item.embedId}`}
                          title={item.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none'
                          }}
                        />
                      </Box>
                      <CardContent>
                        <Typography variant="h6" component="h4" gutterBottom>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Project Gallery */}
          <Box>
            <Typography variant="h4" component="h3" gutterBottom textAlign="center" sx={{ color: 'primary.light', mb: 4 }}>
              Project Gallery
            </Typography>
            <Grid container spacing={4}>
              {portfolioItems.filter(item => item.type === 'image').map((item, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                  >
                    <Card elevation={6} sx={{ borderRadius: 2, transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' } }}>
                      <CardActionArea>
                        <CardMedia
                          component="img"
                          height="300"
                          image={item.image}
                          alt={item.title}
                        />
                        <CardContent>
                          <Typography variant="h6" component="h4" gutterBottom>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box textAlign="center" mt={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => scrollToSection("contact")}
                sx={{ px: 6, py: 1.5 }}
              >
                See More Work
              </Button>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, bgcolor: 'primary.dark' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
              Ready to Tell Your Story?
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography variant="h6" paragraph sx={{ color: 'grey.300', mb: 4 }}>
              Contact us today to discuss how Offworld Media Africa can help bring your vision to life through exceptional media production.
            </Typography>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => scrollToSection("contact")}
              sx={{ px: 6, py: 1.5, color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}
            >
              Get in Touch
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }} id="contact">
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'white' }}>
              Contact Us
            </Typography>
            <Typography variant="subtitle1" paragraph sx={{ color: 'grey.300' }}>
              Reach out to discuss your project or request more information
            </Typography>
            <Divider sx={{ width: 80, height: 4, bgcolor: 'primary.main', mx: 'auto' }} />
          </motion.div>

          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Card elevation={6} sx={{ bgcolor: 'grey.900', borderRadius: 2 }}>
                  <CardContent sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            id="name"
                            label="Your Name"
                            variant="outlined"
                            value={formData.name}
                            onChange={handleChange}
                            InputLabelProps={{ style: { color: 'grey.300' } }}
                            InputProps={{
                              style: { color: 'white' },
                              sx: { '& fieldset': { borderColor: 'grey.700' } }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            id="email"
                            label="Email Address"
                            type="email"
                            variant="outlined"
                            value={formData.email}
                            onChange={handleChange}
                            InputLabelProps={{ style: { color: 'grey.300' } }}
                            InputProps={{
                              style: { color: 'white' },
                              sx: { '& fieldset': { borderColor: 'grey.700' } }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            id="subject"
                            label="Subject"
                            variant="outlined"
                            value={formData.subject}
                            onChange={handleChange}
                            InputLabelProps={{ style: { color: 'grey.300' } }}
                            InputProps={{
                              style: { color: 'white' },
                              sx: { '& fieldset': { borderColor: 'grey.700' } }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextareaAutosize
                            id="message"
                            minRows={5}
                            placeholder="Your Message"
                            value={formData.message}
                            onChange={handleChange}
                            style={{
                              width: '100%',
                              padding: '16.5px 14px',
                              borderRadius: '4px',
                              border: '1px solid rgba(255, 255, 255, 0.23)',
                              backgroundColor: 'transparent',
                              color: 'white',
                              fontFamily: 'inherit',
                              fontSize: '1rem'
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ py: 1.5 }}
                          >
                            Send Message
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card elevation={6} sx={{ mt: 4, bgcolor: 'grey.900', borderRadius: 2 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" component="h4" gutterBottom sx={{ color: 'white' }}>
                      Follow Us
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {socialLinks.map((social, index) => (
                        <IconButton
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'primary.dark' }
                          }}
                        >
                          {social.icon}
                        </IconButton>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {/* Map */}
                <Card elevation={6} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Box sx={{ height: 300 }}>
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.6538924638604!2d3.4212331755609733!3d6.428790224057089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103bf5335739b327%3A0x370a1d23f7d89cce!2sVictoria%20Island%2C%20Lagos%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1684147642755!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Offworld Media Africa Location"
                    />
                  </Box>
                </Card>

                {/* Contact Information */}
                <Card elevation={6} sx={{ mt: 4, bgcolor: 'grey.900', borderRadius: 2 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ color: 'white' }}>
                      Get in Touch
                    </Typography>
                    <List>
                      {contactInfo.map((info, index) => (
                        <React.Fragment key={index}>
                          <ListItem disableGutters sx={{ alignItems: 'flex-start', py: 2 }}>
                            <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                              {info.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle1" sx={{ color: 'white' }}>
                                  {info.title}
                                </Typography>
                              }
                              secondary={
                                info.content.map((line, i) => (
                                  <Typography key={i} variant="body2" sx={{ color: 'grey.400' }}>
                                    {line}
                                  </Typography>
                                ))
                              }
                            />
                          </ListItem>
                          {index < contactInfo.length - 1 && <Divider sx={{ borderColor: 'grey.700' }} />}
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default NewHomeUI;