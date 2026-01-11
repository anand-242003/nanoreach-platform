import { motion } from 'framer-motion';
import { ArrowRight, Users, DollarSign, Clock } from 'lucide-react';
import { SiInstagram, SiYoutube, SiTiktok } from 'react-icons/si';
import { Link } from 'react-router-dom';

const campaigns = [
  {
    title: 'Summer Collection Launch',
    brand: 'StyleCo',
    budget: '$1,200',
    platform: 'Instagram',
    Icon: SiInstagram,
    iconBg: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    applicants: 24,
    deadline: '3 days',
    tags: ['Fashion', 'Lifestyle'],
  },
  {
    title: 'App Launch Campaign',
    brand: 'TechFlow',
    budget: '$2,500',
    platform: 'TikTok',
    Icon: SiTiktok,
    iconBg: 'bg-black',
    applicants: 56,
    deadline: '5 days',
    tags: ['Tech', 'Tutorial'],
  },
  {
    title: 'Product Review Series',
    brand: 'GadgetPro',
    budget: '$800',
    platform: 'YouTube',
    Icon: SiYoutube,
    iconBg: 'bg-red-600',
    applicants: 18,
    deadline: '7 days',
    tags: ['Tech', 'Review'],
  },
];

export default function LiveCampaigns() {
  return (
    <section id="creators" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-sm text-green-600 font-medium">Live now</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 tracking-tight mb-2">Featured campaigns</h2>
            <p className="text-neutral-500">Apply to campaigns that match your niche</p>
          </div>
          <Link to="/campaigns" className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition-colors text-sm font-medium">
            Browse all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="space-y-4">
          {campaigns.map((campaign, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className={`${campaign.iconBg} p-4 rounded-2xl text-white shrink-0 w-fit`}>
                    <campaign.Icon className="h-8 w-8" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {campaign.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 mb-1 truncate">{campaign.title}</h3>
                    <p className="text-neutral-500">by {campaign.brand}</p>
                  </div>

                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-neutral-900 font-semibold text-lg">
                        <DollarSign className="h-4 w-4 text-neutral-400" />
                        {campaign.budget}
                      </div>
                      <p className="text-xs text-neutral-400">Budget</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-neutral-900 font-semibold text-lg">
                        <Users className="h-4 w-4 text-neutral-400" />
                        {campaign.applicants}
                      </div>
                      <p className="text-xs text-neutral-400">Applied</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 text-neutral-900 font-semibold text-lg">
                        <Clock className="h-4 w-4 text-neutral-400" />
                        {campaign.deadline}
                      </div>
                      <p className="text-xs text-neutral-400">Left</p>
                    </div>
                  </div>

                  <button className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors shrink-0">
                    Apply now
                  </button>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
