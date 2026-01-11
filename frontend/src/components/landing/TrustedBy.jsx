import { 
  SiSpotify, SiNotion, SiStripe, SiSlack, SiVercel, SiLinear, SiFigma, SiShopify, SiAirbnb, SiNetflix
} from 'react-icons/si';

const logos = [
  { name: 'Spotify', Icon: SiSpotify },
  { name: 'Notion', Icon: SiNotion },
  { name: 'Stripe', Icon: SiStripe },
  { name: 'Slack', Icon: SiSlack },
  { name: 'Vercel', Icon: SiVercel },
  { name: 'Linear', Icon: SiLinear },
  { name: 'Figma', Icon: SiFigma },
  { name: 'Shopify', Icon: SiShopify },
  { name: 'Airbnb', Icon: SiAirbnb },
  { name: 'Netflix', Icon: SiNetflix },
];

export default function TrustedBy() {
  return (
    <section className="py-16 overflow-hidden">
      <p className="text-center text-sm text-neutral-400 mb-10">Trusted by teams at</p>
      
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
        
        <div className="flex animate-scroll">
          {[...logos, ...logos].map(({ name, Icon }, index) => (
            <div 
              key={`${name}-${index}`} 
              className="flex items-center gap-2 mx-8 text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
            >
              <Icon className="h-6 w-6" />
              <span className="text-lg font-medium whitespace-nowrap">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
