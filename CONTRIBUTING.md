# Contributing to DeepDialogue Template

This document describes how to contribute to the template and how to manage your own projects based on it.

## Template Update Strategy

### For Template Maintainers

1. **Branch Structure**
   - `main`: Latest stable template version
   - `develop`: Development branch for next template version
   - `feature/*`: Feature branches for template improvements

2. **Version Control**
   - Use semantic versioning for template releases
   - Tag all releases with proper version numbers
   - Maintain a detailed CHANGELOG.md

3. **Testing Updates**
   - Maintain a test project that uses the template
   - Test all changes against this project before releasing

### For Projects Using the Template

1. **Initial Setup**
```bash
# After creating your project from the template:
git remote add template https://github.com/original/template-repo.git
git fetch template
git branch template-updates template/main
```

2. **Receiving Updates**
```bash
# Fetch latest template changes
git fetch template

# Switch to template-updates branch
git checkout template-updates

# Merge template changes
git merge template/main

# Review changes and resolve conflicts
# Test thoroughly

# Merge to your main branch
git checkout main
git merge template-updates
```

## Best Practices

### Customizing the Template

1. **Keep Core Separate**
   - Create a `core/` directory for your base functionality
   - Put project-specific code in `features/`
   - Maintain clear boundaries between template and custom code

2. **Configuration Management**
   - Use environment-specific config files
   - Override only what's necessary
   - Keep sensitive data in environment variables

3. **Module Organization**
```
src/
├── modules/
│   ├── core/           # Template core (avoid modifying)
│   ├── features/       # Your custom features
│   │   ├── custom1/
│   │   └── custom2/
│   └── infrastructure/ # Infrastructure extensions
```

### Making Template Contributions

1. Create a fork of the template repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## Template Update Workflow

### For Template Maintainers

1. **Making Changes**
```bash
git checkout develop
git checkout -b feature/new-feature
# Make changes
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

2. **Releasing Updates**
```bash
git checkout main
git merge develop
git tag -a v1.2.0 -m "Version 1.2.0"
git push origin main --tags
```

### For Project Maintainers

1. **Regular Update Check**
```bash
# Weekly or monthly
git fetch template
git log HEAD..template/main --oneline
```

2. **Applying Updates**
```bash
# Create an update branch
git checkout -b update/template-v1.2.0
git merge template/main

# Resolve conflicts and test
npm test

# Update your main branch
git checkout main
git merge update/template-v1.2.0
```

## Additional Resources

- [Template Documentation](./docs/README.md)
- [Upgrade Guides](./docs/UPGRADING.md)
- [Change Log](./CHANGELOG.md)
