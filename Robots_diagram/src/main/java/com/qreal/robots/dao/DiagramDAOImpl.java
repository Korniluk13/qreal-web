package com.qreal.robots.dao;

import com.qreal.robots.model.diagram.Diagram;
import com.qreal.robots.model.diagram.Folder;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.ArrayList;

/**
 * Created by vladzx on 07.11.14.
 */
@Repository
public class DiagramDAOImpl implements DiagramDAO {
    private static final Logger LOG = Logger.getLogger(DiagramDAOImpl.class);

    @Autowired
    private SessionFactory sessionFactory;

    public DiagramDAOImpl() {
    }

    public DiagramDAOImpl(SessionFactory sessionFactory) {
        this.sessionFactory = sessionFactory;
    }

    public String save(Diagram diagram) {
        LOG.debug("saving diagram");
        Session session = sessionFactory.getCurrentSession();
        List<Diagram> diagrams = session.createQuery("from Diagram where folderId=? and name=?")
                .setParameter(0, diagram.getFolderId())
                .setParameter(1, diagram.getName())
                .list();

        if (!diagrams.isEmpty()) {
            return "This diagram already exists.";
        }
        else {
            session.save(diagram);
            return "OK";
        }
    }

    public Diagram openById(Long diagramId) {
        Session session = sessionFactory.getCurrentSession();
        return (Diagram) session.get(Diagram.class, diagramId);
    }

    public Diagram openByName(String name) {
        LOG.debug("open diagram");
        Session session = sessionFactory.getCurrentSession();
        List<Diagram> diagrams = session.createQuery("from Diagram where name=?").setParameter(0, name).list();
        return (diagrams.isEmpty() ? null : diagrams.get(0));
    }

    public List<String> showDiagramsByUserName(String userName) {
        Session session = sessionFactory.getCurrentSession();
        List<Diagram> diagrams = session.createQuery("from Diagram where username=?").setParameter(0, userName).list();

        List<String> namesDiagrams = new ArrayList<String>();
        for (Diagram diagram : diagrams) {
            namesDiagrams.add(diagram.getName());
        }
        return namesDiagrams;
    }

    public boolean exists(String name) {
        Session session = sessionFactory.getCurrentSession();
        List<Diagram> diagrams = session.createQuery("from Diagram where name=?").setParameter(0, name).list();
        return (!diagrams.isEmpty());
    }

    public String createFolder(Folder folder) {
        LOG.debug("creating folder");
        Session session = sessionFactory.getCurrentSession();
        List<Folder> folders = session.createQuery("from Folder where folderName=? and username=? and folderParent=?")
                .setParameter(0, folder.getFolderName())
                .setParameter(1, folder.getCreator().getUsername())
                .setParameter(2, folder.getFolderParent())
                .list();

        if (folders.isEmpty()) {
            session.save(folder);
            return "OK";
        }

        return "This folder already exists.";
    }

    public List<String> showFoldersByUserName(String userName, String currentFolder) {
        Session session = sessionFactory.getCurrentSession();
        List<Folder> folders = session.createQuery("from Folder where folderParent=? and username=?")
                .setParameter(0, currentFolder)
                .setParameter(1, userName)
                .list();

        List<String> folderNames = new ArrayList<String>();
        for (Folder folder : folders) {
            folderNames.add(folder.getFolderName());
        }
        return folderNames;
    }

    public String getParentFolder(String userName, String currentFolder) {
        Session session = sessionFactory.getCurrentSession();
        List<Folder> folders = session.createQuery("from Folder where folderName=? and username=?")
                .setParameter(0, currentFolder)
                .setParameter(1, userName)
                .list();

        return folders.get(0).getFolderParent();
    }

    public List<String> showDiagramNames(String folderId) {
        Session session = sessionFactory.getCurrentSession();
        List<Diagram> diagrams = session.createQuery("from Diagram where folderId=?").setParameter(0, folderId).list();

        List<String> namesDiagrams = new ArrayList<String>();
        for (Diagram diagram : diagrams) {
            namesDiagrams.add(diagram.getName());
        }
        return namesDiagrams;
    }
}
