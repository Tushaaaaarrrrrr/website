import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, Video, Users, FileText, Code2, Award } from 'lucide-react';
import BruteButton from '../components/BruteButton';

const courseContent = {
  "python-data-science": {
    title: "Python for Data Science",
    price: "₹1",
    description: "Master the fundamental language of data. Learn Python programming from scratch with a focus on data manipulation, analysis, and visualization libraries like Pandas, NumPy, and Matplotlib. No prior coding experience required.",
    learn: [
      "Core Python syntax and data structures",
      "Data wrangling with Pandas & NumPy",
      "Data visualization techniques",
      "Exploratory Data Analysis (EDA)"
    ],
    who: "Beginners looking to break into data science, analysts wanting to transition to Python, and students seeking a strong programming foundation.",
    outcomes: "You will be able to process raw data, extract insights, and build interactive visualizations ready for industrial reporting."
  },
  "deep-learning": {
    title: "Deep Learning Mastery",
    price: "₹399",
    description: "Dive deep into neural networks and advanced machine learning modeling. Learn how to build, train, and deploy deep learning models using TensorFlow and PyTorch for real-world applications.",
    learn: [
      "Neural Network architectures (CNNs, RNNs)",
      "Model optimization and hyperparameter tuning",
      "Computer Vision basics",
      "Natural Language Processing fundamentals"
    ],
    who: "Data scientists and developers with basic machine learning knowledge wanting to specialize in deep learning technologies.",
    outcomes: "You will be able to build image classifiers, predictive text models, and deploy deep learning pipelines."
  },
  "advanced-ai": {
    title: "Advanced AI & ML",
    price: "₹499",
    description: "The ultimate industrial AI curriculum. Master advanced predictive algorithms, generative models, and end-to-end ML system deployment. Built for engineers who want to architect scalable AI solutions.",
    learn: [
      "Advanced ML Algorithms (XGBoost, LightGBM)",
      "Generative AI & LLM Integration",
      "MLOps and Model Deployment workflows",
      "Building scalable recommendation systems"
    ],
    who: "Experienced professionals and aspiring AI Architects looking to lead highly technical AI projects.",
    outcomes: "You will possess the skills to architect, deploy, and monitor production-ready machine learning systems."
  }
};

const features = [
  { icon: <Video className="text-primary" />, text: "Recorded Lectures" },
  { icon: <Users className="text-primary" />, text: "Live Doubt Sessions" },
  { icon: <FileText className="text-primary" />, text: "Assignments" },
  { icon: <Code2 className="text-primary" />, text: "Real Projects" },
  { icon: <Award className="text-primary" />, text: "Certification" }
];

function CoursePage() {
  const { id } = useParams<{ id: string }>();
  // @ts-ignore
  const course = id && courseContent[id] ? courseContent[id] : courseContent["python-data-science"];

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
      <Link to="/#courses" className="inline-flex items-center gap-2 text-surface/60 font-bold uppercase tracking-widest text-sm hover:text-primary mb-12 transition-colors">
        <ArrowLeft size={16} /> Back to Registry
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black font-headline uppercase leading-tight mb-6">{course.title}</h1>
            <p className="text-xl text-surface/80 font-bold leading-relaxed border-l-4 border-primary pl-6">
              {course.description}
            </p>
          </motion.div>

          {/* What You Will Learn */}
          <div className="brute-card bg-surface p-8 text-black">
            <h3 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary text-white flex items-center justify-center">01</span>
              What You Will Learn
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.learn.map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3 font-bold border-2 border-black/10 p-4">
                  <Check className="text-primary shrink-0" />
                  <span className="leading-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Who This Is For & Outcomes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-2xl font-black uppercase mb-4 text-surface border-b-2 border-primary inline-block pb-1">Target Audience</h4>
              <p className="text-surface/70 font-bold">{course.who}</p>
            </div>
            <div>
              <h4 className="text-2xl font-black uppercase mb-4 text-surface border-b-2 border-primary inline-block pb-1">Outcomes</h4>
              <p className="text-surface/70 font-bold">{course.outcomes}</p>
            </div>
          </div>
        </div>

        {/* Sidebar / Checkout */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 brute-card flex flex-col">
            <div className="p-8 border-b-4 border-black bg-white/5">
              <div className="text-sm font-black uppercase text-surface/50 tracking-widest mb-2">Enrollment Cost</div>
              <div className="text-primary font-black text-6xl italic leading-none mb-6">{course.price}</div>
              <BruteButton variant="primary" className="w-full text-xl py-4">Buy Now</BruteButton>
            </div>
            
            <div className="p-8 bg-surface text-black space-y-6">
              <h4 className="font-black uppercase tracking-widest border-b-2 border-black pb-2">Features Included</h4>
              <ul className="space-y-4">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 font-bold uppercase text-sm">
                    <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center shrink-0">
                      {feat.icon}
                    </div>
                    {feat.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
