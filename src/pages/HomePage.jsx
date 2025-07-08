import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CodeBracketIcon,
  TrophyIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

const HomePage = () => {
  const features = [
    {
      name: 'Real-time Coding',
      description: 'Code in our advanced Monaco editor with instant feedback and live collaboration.',
      icon: CodeBracketIcon,
      color: 'text-primary-600'
    },
    {
      name: 'Live Leaderboards',
      description: 'Compete with others and see real-time rankings updated instantly.',
      icon: TrophyIcon,
      color: 'text-success-600'
    },
    {
      name: 'Team Challenges',
      description: 'Collaborate with friends in team competitions and hackathons.',
      icon: UsersIcon,
      color: 'text-warning-600'
    },
    {
      name: '24/7 Availability',
      description: 'Practice and compete anytime with our global community.',
      icon: ClockIcon,
      color: 'text-danger-600'
    }
  ]

  const stats = [
    { name: 'Active Users', value: '50K+' },
    { name: 'Challenges Completed', value: '100K+' },
    { name: 'Lines of Code', value: '1M+' },
    { name: 'Success Rate', value: '95%' }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer at Google',
      content: 'SkillSprint helped me improve my coding skills dramatically. The real-time challenges are addictive!',
      avatar: '/api/placeholder/40/40'
    },
    {
      name: 'Alex Rodriguez',
      role: 'CS Student at MIT',
      content: 'The best platform for practicing algorithms and competing with peers. Love the instant feedback!',
      avatar: '/api/placeholder/40/40'
    },
    {
      name: 'David Kim',
      role: 'Tech Lead at Microsoft',
      content: 'We use SkillSprint for our team building events. The collaboration features are outstanding.',
      avatar: '/api/placeholder/40/40'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  Code. Compete.{' '}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Conquer.
                  </span>
                </h1>
                <p className="mt-6 text-xl text-primary-100 max-w-2xl">
                  Join the ultimate coding arena where developers showcase their skills, 
                  compete in real-time challenges, and climb the global leaderboards.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Start Competing</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                  <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors flex items-center justify-center space-x-2">
                    <PlayIcon className="w-5 h-5" />
                    <span>Watch Demo</span>
                  </button>
                </div>
              </motion.div>
            </div>
            <div className="lg:col-span-6 mt-12 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gray-900 rounded-xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="font-mono text-sm">
                    <div className="text-blue-400">function</div>
                    <div className="text-yellow-400">solveProblem</div>
                    <div className="text-white">(challenge) {'{}'}</div>
                    <div className="text-gray-400 ml-4">// Your code here</div>
                    <div className="text-green-400 ml-4">return solution;</div>
                    <div className="text-white">{'}'}</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl lg:text-4xl font-bold text-primary-600">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-2">{stat.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SkillSprint?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most advanced coding competition platform with features 
              designed to challenge and inspire developers at every level.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className={`w-12 h-12 ${feature.color} mb-6`}>
                  <feature.icon className="w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.name}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Loved by Developers Worldwide
            </h2>
            <div className="flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-600 mt-2">4.9/5 from over 10,000 reviews</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Start Your Coding Journey?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of developers who are already improving their skills on SkillSprint.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
              <Link
                to="/challenges"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors"
              >
                Explore Challenges
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-primary-100">
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckIcon className="w-4 h-4" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
