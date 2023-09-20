import * as React from "react";
import { Card, CardContent, Typography, Button, Chip } from '@material-ui/core';
import "../../css/publications.css";
import { CSSProperties } from '@material-ui/styles';
import { makeStyles } from '@material-ui/core/styles';
import "../../css/cardStyles.css";


interface ProjectProps {
  name: string;
  short_name: string;
  description: string;
  publicationLink: string;
  journal: string;
  authors: string[];
  doi: string;
  bibtex: string;
  year: string;
  tags: string[];
  status: string;
  urlpdf: string;
}


const ProjectCard: React.FC<{ project: ProjectProps }> = ({ project }) => {
  const [showBibtex, setShowBibtex] = React.useState(false);
  const getKeywordColor = (index: number): string => {
    const colors = [
      "#FF6F61",
      "#6B5B95",
      "#88B04B",
      "#F7CAC9",
      "#92A8D1",
      "#955251",
      "#B565A7",
      "#009B77",
      "#DD4124",
      "#D65076",
      "#45B8AC",
      "#EFC050",
      "#5B5EA6",
    ];

    return colors[index % colors.length];
  };

  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  const cardContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '10px',
    borderColor: '#ddd',
    backgroundColor: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), #fff)',
    boxShadow: '0 0 #0000',
  };

  const useStyles = makeStyles((theme) => ({
    doiTag: {
      fontSize: "12px",
      backgroundColor: "#f1f1f1",
      padding: "5px 10px",
      borderRadius: "50px",
      marginLeft: "10px",
      color: "#333"
    }

  }));


  const cardContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'space-between'
  };


  const moreInfoStyle: React.CSSProperties = {
    padding: '10px',
  };

  const classes = useStyles();

  const cardStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: '.75rem',
    borderWidth: 1,
    borderColor: 'rgba(245, 243, 255, 1)',
    background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), #fff)',
    padding: '1.5rem 0.75rem 1rem 0.75rem',
    boxShadow: '0 0 #0000',
    transition: 'box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  return (
    <div className="ui card model-card-container" style={cardContainerStyle}>

      <div className="content" style={cardContentStyle}>
        <div className="header">{project.name}</div>

        <div className="description card-text">
          <p>{project.description}</p>
        
        </div>
      </div>
      <div className="extra content" style={moreInfoStyle}>
        {/* Implement buttons or links for DOI, Bibtex, etc */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
        <Button className="ui button" 
            href={project.urlpdf}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginRight: 10 }}
          >
            View PDF
          </Button>
          <Button 
           className="ui button" 
            href={project.urlpdf}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Publication
          </Button>
        </div>
      </div>
    </div>
  );

};

export const PublicationPage: React.FC = () => {

  // A list of your projects. You can replace this with data fetched from an API.
  const projects = [
    {
      name: 'A self-supervised deep learning method for data-efficient training in genomics',
      short_name: "Self-GenomeNet",
      publicationLink: '#',
      status: 'in print',
      journal: 'Nature Communications Biology',
      authors: ['Author1', 'Author2 [Joint Supervision]', 'Author3'],
      doi: 'doi:e23s3dsda',
      bibtex: 'Sample BibTeX1',
      year: '2023',
      urlpdf: 'todo',
      tags: ["novel model architecture"],
      description: 'Our novel self-supervised learning method tailored for genomic data analysis. By predicting sequences of varying lengths and maximizing mutual information, we overcome limitations of existing methods. Our method efficiently utilizes unannotated genomic data to improve performance on various genomic tasks, thus enabling new applications and accelerating deep learning model development for computational biology.',
    },
    {
      name: 'GenomeNet-Architect',
      short_name: "GenomeNet-Architect",
      publicationLink: '#',
      journal: '',
      status: 'under revision',
      bibtex: 'Sample BibTeX1',
      authors: ['Author1', 'Author2 [Joint Supervision]', 'Author3'],
      doi: 'doi:e23s3dsda',
      year: '2023',
      urlpdf: 'todo',
      tags: ["novel model architecture"],
      description: 'GenomeNet-Architect is our platform for optimizing architecture designs based on specific datasets. Our optimized model reduces the read-level misclassification significantly and improves runtime, achieving contig-level accuracy with fewer parameters. It offers a unique and improved approach to deep learning in genomics, providing a systematic framework for designing architectures and avoiding ad-hoc choices.',
    },
    {
      name: 'The deepG package',
      short_name: 'deepG',
      publicationLink: '#',
      journal: '',
      status: 'in preparation',
      authors: ['Author1', 'Author2 [Joint Supervision]', 'Author3'],
      doi: 'https://doi.org/example1',
      bibtex: 'Sample BibTeX1',
      urlpdf: 'todo',
      year: '2022',
      tags: ["novel model architecture"],
      description: 'Our DeepG platform is designed to handle a wide range of genomic data modalities, including data on the read, loci, contig, genomic, and metagenomic level. With advanced neural network architectures, data augmentation, subsampling methods, and support for internal data encoding, DeepG is highly versatile and adaptable. It enables improved performance where training sets consist of genomes from different taxons, and can serve as a basis for further software development efforts.'
    },
    {
      name: 'Transformer Model for Genome Sequence Analysis',
      short_name: "transformer",
      publicationLink: 'https://epub.ub.uni-muenchen.de/94459/1/BA_Hurmer.pdf',
      journal: 'Bachelor Thesis',
      status: 'published',
      authors: ['Mina Rezaei', 'Martin Binder', 'Huseyin Anil Gündüz'],
      doi: '',
      urlpdf: 'todo',
      bibtex: 'Sample BibTeX1',
      year: '2022',
      tags: ["novel model architecture"],
      description: "This research investigates the application of the Transformer Encoder model, a technique adapted from Natural Language Processing, to solve complex genomic tasks. Using high-throughput sequencing data, the study explores self-supervised, semi-supervised, and supervised training methods to classify bacteriophages. Although resource-intensive, the model outperforms existing techniques in accuracy and exhibits strong transfer learning capabilities. The work also delves into optimizations like tokenization methods and pretext tasks to enhance the model's performance. This exploration underscores the Transformer Encoder's potential in genomic classification tasks and indicates avenues for future research."
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: 'auto' }}>
   <h2>Publications</h2>
      <Typography variant="body1">
        The GenomeNet project is a BMBF funded joint research enterprise of the Helmholtz Centre for Infection Research and the University of Munich with close collaboration with the Harvard T.H. Chan School of Public Health. In this project we aim to develop customized deep learning network architectures which are particularly suited for modeling of large nucleotide sequences. These networks will then be employed on bacterial, viral and human genomes with the goal to understand the complex structures underlying the code of life. This work is funded by the Federal Ministry of Education and Research (031L0199A).
      </Typography>

      {projects.map((project, i) => (
        <ProjectCard key={i} project={project} />
      ))}
    </div>
  );
};

export default PublicationPage;
