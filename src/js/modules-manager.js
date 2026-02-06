
// Manages loading of module data and dynamic question counting

export const modulesManager = {
  _cache: null,

  async getModules() {
    if (this._cache) return this._cache;

    try {
      // Load the index
      // publicDir is configured as 'src/data' in vite.config.js
      // So these files are served at the root
      
      const indexResponse = await fetch('/modules-index.json');
      const indexData = await indexResponse.json();
      
      // Now fetch each MCQ file to count questions
      const modules = await Promise.all(indexData.modules.map(async (mod) => {
        try {
          if (!mod.mcqFile) return { ...mod, questionCount: 0 };
          
          // MCQs are in src/data/mcq, so they are served at /mcq/
          const mcqPath = `/mcq/${mod.mcqFile}`;
          const mcqResponse = await fetch(mcqPath);
          const mcqData = await mcqResponse.json();
          
          // Count questions in mcq_set
          const realCount = mcqData.mcq_set ? mcqData.mcq_set.length : 0;
          
          return {
            ...mod,
            questionCount: realCount
          };
        } catch (e) {
          console.error(`Error loading questions for module ${mod.id}:`, e);
          return mod; // Return original module (with default count) on error
        }
      }));

      
      this._cache = modules;
      return modules;
    } catch (error) {
      console.error('Error loading modules index:', error);
      return [];
    }
  },

  async getModuleById(id) {
    const modules = await this.getModules();
    return modules.find(m => m.id === id);
  }
};
