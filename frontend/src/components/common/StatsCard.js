import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = '#722083', lightBg = 'rgba(114, 32, 131, 0.08)' }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.06)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.04em' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
              {value}
            </Typography>
          </Box>
          {Icon && (
            <Avatar
              sx={{
                bgcolor: lightBg,
                color: color,
                width: 46,
                height: 46,
                borderRadius: '10px'
              }}
            >
              <Icon size={22} color={color} />
            </Avatar>
          )}
        </Box>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
