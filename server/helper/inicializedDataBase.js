/* eslint-disable no-use-before-define */

const mongoose = require('mongoose');
// const schedule = require('node-schedule');
const MD5 = require('md5');

module.exports = {
  start() {
    console.log('inicializando serviços de banco de dados padrão...');
    creatDefautlUserAdmin();
  },
};
// =================================================================================================
// Criar metodos a serem executados depois que o bando de dados ja estiver inicializado e conectado
// =================================================================================================
async function creatDefautlUserAdmin() {
  const Usuario = mongoose.model('Usuario');
  const Negocio = mongoose.model('Negocio');
  const UsuarioNegocio = mongoose.model('UsuarioNegocio');
  const defaultUser = {
    login: 'administrador@maildominio.com.br',
    senha: MD5('adminxuk01'),
    nome: 'Administrador',
    ativo: true,
    admin: true,
  };
  const defaultNegocio = {
    nome: 'Administrador WEB-APP',
    ativo: true,
  };
  try {
    const userAdmin = await Usuario.findOne({ login: defaultUser.login });
    // console.log('userAdmin: ', userAdmin)
    if (!userAdmin) {
      // console.log('Criando no userAdmin: ', defaultUser)
      const usuario = await new Usuario(defaultUser).save();
      const estabeleciomento = await new Negocio(defaultNegocio).save();
      new UsuarioNegocio({ usuarioId: usuario._id, negocioId: estabeleciomento._id, ativo: true }).save();
    }
  } catch (error) {
    console.error('inicializedDataBase.creatDefautlUserAdmin: ', error);
  }
}
