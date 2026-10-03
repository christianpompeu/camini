const fs = require('fs');

const filesToProcess = ['c:/projects/camini/app/playground/page.tsx', 'c:/projects/camini/app/not-found.tsx', 'c:/projects/camini/app/page.tsx'];

function processFiles(files) {
  for (const file of files) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      const replacements = {
        'text-energy-blue': 'text-camini-cobalt',
        'bg-energy-blue': 'bg-camini-cobalt',
        'border-energy-blue': 'border-camini-cobalt',
        'shadow-energy-blue': 'shadow-blue-500',
        'ring-energy-blue': 'ring-camini-cobalt',
        'text-energy-violet': 'text-camini-indigo',
        'border-energy-violet': 'border-camini-indigo',
        'text-energy-green': 'text-camini-aqua',
        'bg-energy-green': 'bg-camini-aqua',
        'text-energy-amber': 'text-amber-500',
        'text-energy-coral': 'text-red-500',
        'bg-gradient-energy': 'bg-gradient-camini',
        'text-gradient-energy': 'text-transparent bg-clip-text bg-gradient-camini',
        'variant="energy"': 'variant="camini"',
        "variant: 'energy'": "variant: 'camini'",
        'energy-blue': 'camini-cobalt',
        'Energy Blue': 'Camini Cobalt',
        'Energy Cyan': 'Camini Cyan',
        'Energy Violet': 'Camini Indigo',
        'Energy Coral': 'Camini Red',
        'Energy Amber': 'Camini Amber',
        'Energy Green': 'Camini Aqua',
        'energy-cyan': 'camini-cyan',
        'energy-violet': 'camini-indigo',
        'energy-coral': 'camini-red',
        'energy-amber': 'amber-500',
        'energy-green': 'camini-aqua'
      };

      for (const [key, value] of Object.entries(replacements)) {
        content = content.split(key).join(value);
      }
      fs.writeFileSync(file, content);
    }
  }
}

processFiles(filesToProcess);
console.log('Replaced tokens in playground and not-found');
