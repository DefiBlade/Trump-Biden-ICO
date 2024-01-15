import Typography from '@mui/material/Typography';
//import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import EmailIcon from '@mui/icons-material/Email';
//import RedditIcon from '@mui/icons-material/Reddit';
import TelegramIcon from '@mui/icons-material/Telegram';
import FacebookIcon from '@mui/icons-material/Facebook';
//import InstagramIcon from '@mui/icons-material/Instagram';
import MediumIcon from '../ui/icons/Medium'
import DiscordIcon from '../ui/icons/Discord'
import YoutubeIcon from '@mui/icons-material/YouTube';
import certik from "../../assets/images/partners/certik.svg";
import fairyproof from "../../assets/images/partners/fairyproof.png";

const partners = [
  {
    label: "certik", 
    src: certik, 
    width: 150,
    //href: "https://www.certik.com/"
  },
  {
    label: "fairyproof", 
    src: fairyproof, 
    //href: "",
    width: 130
  },
]

const socialLinks = [
  {
    label: 'Twitter',
    icon: <TwitterIcon />,
    href: 'https://twitter.com/trumpvbiden2024'
  },
  {
    label: 'Telegram',
    icon: <TelegramIcon />,
    href: 'https://t.me/+FhOkrPeeq6M5M2M5'
  },
  {
    label: 'Discord',
    icon: <DiscordIcon />,
    href: 'https://discord.com/invite/jUUsyXuYDE'
  },
  // {
  //   label: 'YouTube',
  //   Icon: <YoutubeIcon />,
  //   href: 'https://www.youtube.com/channel/UCJ3gqtBalhX-lRlMURXG'
  // },
  // {
  //   label: 'Facebook',
  //   icon: <FacebookIcon />,
  //   href: 'https://www.facebook.com/andromedachain.org'
  // }
]

const Footer = () => {
  return (
    <Container sx={{mt: 5}}>
      <Typography sx={{color: 'text.secondary', textAlign: 'center'}}>Audited by</Typography>
      <Stack 
        direction="row" 
        spacing={2} 
        mt={2}
        alignItems="center"
        justifyContent="center"
      >
        {partners.map((partner, i) => (
          <a
            key={i}
            href={partner.href}
            target="_blank" 
            rel="noreferrer"
            style={{filter: 'grayscale(100%)'}}
          >
            <img 
              src={partner.src} 
              alt={partner.label}
              width={partner.width}
            />
          </a>
        ))}
      </Stack>
      <Grid 
        container 
        spacing={2} 
        alignItems="center" 
        justifyContent="center"
        my={2}
      >
        {socialLinks.map((link) => (
          <Grid item xs={2} md={1} sx={{textAlign: 'center'}} key={link.label}>
            <IconButton 
              component="a"
              href={link.href}
              target="_blank"
              aria-label={link.label} 
            >
              {link.icon}
            </IconButton>
          </Grid>
        ))}
        {/* <Grid item xs={2} md={1} sx={{textAlign: 'center'}}>
          <IconButton 
            component="a"
            href="https://www.andromedachain.org"
            aria-label="Email"
          >
            <EmailIcon />
          </IconButton>
        </Grid> */}
      </Grid>
      <Typography 
        variant="caption"
        display="block"
        color="text.secondary"
        sx={{mt: 3, pb: 3, textAlign: 'center'}}
      >
        {'Copyright © '} {new Date().getFullYear()} Trump v Biden. All rights reserved. 
      </Typography>
    </Container>
  );
}
 
export default Footer;
